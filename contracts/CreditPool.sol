// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title CreditPool
 * @dev Havuz bazlı kredi sistemi - Likidite sağlayıcılar havuza ETH yatırır
 *      Borç alanlar teminat göstererek kredi çeker
 */
contract CreditPool is Ownable, ReentrancyGuard, Pausable {
    
    // Kredi durumu
    enum CreditStatus { Active, Repaid, Defaulted, Liquidated }
    
    // Minimum/Maximum kredi limitleri
    uint256 public constant MIN_CREDIT_AMOUNT = 0.01 ether;
    uint256 public constant MAX_CREDIT_PER_ASSET = 10 ether;
    
    // Temerrüt süresi (30 gün)
    uint256 public constant DEFAULT_PERIOD = 30 days;
    
    // Yıllık faiz oranı (basis points - 10000 = %100)
    uint256 public annualInterestRate = 1200; // %12
    
    // Havuz durumu
    uint256 public totalLiquidity;
    uint256 public totalBorrowed;
    uint256 public totalInterestEarned;
    
    // Kredi kayıtları
    struct Credit {
        uint256 id;
        address borrower;
        uint256 assetId;
        uint256 principal;
        uint256 interest;
        uint256 totalRepayment;
        uint256 amountRepaid;
        uint256 startTime;
        uint256 dueDate;
        CreditStatus status;
    }
    
    uint256 private _creditCounter;
    mapping(uint256 => Credit) public credits;
    mapping(address => uint256[]) private _userCredits;
    
    // Likidite sağlayıcıları
    mapping(address => uint256) public liquidityProviders;
    address[] private _providerList;
    
    // Kontrat adresleri
    address public valuationOracle;
    address public rwaToken;
    address public rwaRegistry;
    
    // Events
    event LiquidityDeposited(address provider, uint256 amount);
    event LiquidityWithdrawn(address provider, uint256 amount);
    event CreditDrawn(uint256 creditId, address borrower, uint256 assetId, uint256 amount);
    event CreditRepaid(uint256 creditId, address borrower, uint256 amount);
    event CreditDefaulted(uint256 creditId, address borrower);
    event CreditLiquidated(uint256 creditId, uint256 assetId);
    event InterestRateUpdated(uint256 newRate);
    
    modifier onlyOracle() {
        require(msg.sender == valuationOracle, "Not valuation oracle");
        _;
    }
    
    modifier onlyToken() {
        require(msg.sender == rwaToken, "Not RWA token");
        _;
    }
    
    modifier onlyRegistry() {
        require(msg.sender == rwaRegistry, "Not RWA registry");
        _;
    }
    
    constructor(address _valuationOracle, address _rwaToken, address _rwaRegistry) {
        valuationOracle = _valuationOracle;
        rwaToken = _rwaToken;
        rwaRegistry = _rwaRegistry;
    }
    
    /**
     * @dev Likidite yatır
     */
    function depositLiquidity() external payable whenNotPaused {
        require(msg.value > 0, "Must deposit ETH");
        
        if (liquidityProviders[msg.sender] == 0) {
            _providerList.push(msg.sender);
        }
        
        liquidityProviders[msg.sender] += msg.value;
        totalLiquidity += msg.value;
        
        emit LiquidityDeposited(msg.sender, msg.value);
    }
    
    /**
     * @dev Likidite çek (kullanılmayan kısım)
     */
    function withdrawLiquidity(uint256 amount) external nonReentrant whenNotPaused {
        require(liquidityProviders[msg.sender] >= amount, "Insufficient liquidity");
        require(totalLiquidity - totalBorrowed >= amount, "Pool insufficient liquidity");
        
        liquidityProviders[msg.sender] -= amount;
        totalLiquidity -= amount;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit LiquidityWithdrawn(msg.sender, amount);
    }
    
    /**
     * @dev Kredi çek (teminat karşılığı)
     */
    function drawCredit(uint256 assetId, uint256 amount) external nonReentrant whenNotPaused returns (uint256) {
        require(amount >= MIN_CREDIT_AMOUNT, "Below minimum credit");
        require(amount <= MAX_CREDIT_PER_ASSET, "Above maximum credit");
        require(totalLiquidity - totalBorrowed >= amount, "Pool insufficient liquidity");
        
        // Değerleme kontrolü - ValuationOracle'dan kredi limiti al
        (uint256 creditLimit, bool isValid) = _getCreditLimit(assetId);
        require(isValid, "Invalid valuation");
        require(amount <= creditLimit, "Exceeds credit limit");
        
        _creditCounter++;
        uint256 creditId = _creditCounter;
        
        // Faiz hesaplama (1 yıl vadeli)
        uint256 interest = (amount * annualInterestRate) / 10000;
        uint256 totalRepayment = amount + interest;
        
        credits[creditId] = Credit({
            id: creditId,
            borrower: msg.sender,
            assetId: assetId,
            principal: amount,
            interest: interest,
            totalRepayment: totalRepayment,
            amountRepaid: 0,
            startTime: block.timestamp,
            dueDate: block.timestamp + 365 days,
            status: CreditStatus.Active
        });
        
        _userCredits[msg.sender].push(creditId);
        totalBorrowed += amount;
        
        // Registry'de varlığın creditId'sini güncelle
        (bool registrySuccess, ) = rwaRegistry.call(
            abi.encodeWithSignature("linkCredit(uint256,uint256)", assetId, creditId)
        );
        require(registrySuccess, "Registry update failed");
        
        // Token kilitle
        _lockToken(assetId);
        
        // ETH transfer
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Credit transfer failed");
        
        emit CreditDrawn(creditId, msg.sender, assetId, amount);
        
        return creditId;
    }
    
    /**
     * @dev Kredi geri öde
     */
    function repayCredit(uint256 creditId) external payable nonReentrant whenNotPaused {
        Credit storage credit = credits[creditId];
        require(credit.borrower == msg.sender, "Not borrower");
        require(credit.status == CreditStatus.Active, "Credit not active");
        
        uint256 remaining = credit.totalRepayment - credit.amountRepaid;
        require(msg.value >= remaining, "Insufficient payment");
        
        credit.amountRepaid += msg.value;
        totalBorrowed -= credit.principal;
        
        // Fazla ödeme varsa iade
        if (msg.value > remaining) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - remaining}("");
            require(success, "Refund failed");
        }
        
        // Faiz geliri
        totalInterestEarned += credit.interest;
        
        // Kredi kapandı
        if (credit.amountRepaid >= credit.totalRepayment) {
            credit.status = CreditStatus.Repaid;
            _unlockToken(credit.assetId);
            // Registry'de creditId'yi sıfırla
            rwaRegistry.call(
                abi.encodeWithSignature("linkCredit(uint256,uint256)", credit.assetId, 0)
            ); // ignore failure - credit is already repaid
        }
        
        emit CreditRepaid(creditId, msg.sender, msg.value);
    }
    
    /**
     * @dev Temerrüt kontrolü
     */
    function checkDefault(uint256 creditId) external {
        Credit storage credit = credits[creditId];
        require(credit.status == CreditStatus.Active, "Credit not active");
        require(block.timestamp > credit.dueDate, "Not due yet");
        
        credit.status = CreditStatus.Defaulted;
        
        emit CreditDefaulted(creditId, credit.borrower);
    }
    
    /**
     * @dev Tasfiye yetkisi (Liquidation kontratından)
     */
    function markAsLiquidated(uint256 creditId) external onlyOwner {
        Credit storage credit = credits[creditId];
        require(credit.status == CreditStatus.Defaulted, "Not defaulted");
        
        credit.status = CreditStatus.Liquidated;
        
        emit CreditLiquidated(creditId, credit.assetId);
    }
    
    /**
     * @dev Kullanıcı kredilerini getir
     */
    function getUserCredits(address user) external view returns (uint256[] memory) {
        return _userCredits[user];
    }
    
    /**
     * @dev Kredi bilgilerini getir
     */
    function getCredit(uint256 creditId) external view returns (
        uint256 id,
        address borrower,
        uint256 assetId,
        uint256 principal,
        uint256 interest,
        uint256 totalRepayment,
        uint256 amountRepaid,
        uint256 startTime,
        uint256 dueDate,
        CreditStatus status
    ) {
        Credit memory c = credits[creditId];
        return (
            c.id,
            c.borrower,
            c.assetId,
            c.principal,
            c.interest,
            c.totalRepayment,
            c.amountRepaid,
            c.startTime,
            c.dueDate,
            c.status
        );
    }
    
    /**
     * @dev Güncel borç miktarı (faiz dahil)
     */
    function getCurrentDebt(uint256 creditId) external view returns (uint256) {
        Credit memory c = credits[creditId];
        if (c.status != CreditStatus.Active) return 0;
        
        uint256 elapsed = block.timestamp - c.startTime;
        uint256 accruedInterest = (c.principal * annualInterestRate * elapsed) / (365 days * 10000);
        
        return c.principal + accruedInterest - c.amountRepaid;
    }
    
    /**
     * @dev Havuz bilgilerini getir
     */
    function getPoolInfo() external view returns (
        uint256 totalLiquidity_,
        uint256 totalBorrowed_,
        uint256 availableLiquidity,
        uint256 utilizationRate,
        uint256 annualInterestRate_
    ) {
        availableLiquidity = totalLiquidity - totalBorrowed;
        utilizationRate = totalLiquidity > 0 ? (totalBorrowed * 10000) / totalLiquidity : 0;
        
        return (totalLiquidity, totalBorrowed, availableLiquidity, utilizationRate, annualInterestRate);
    }
    
    /**
     * @dev Faiz oranını güncelle
     */
    function setInterestRate(uint256 newRate) external onlyOwner {
        require(newRate <= 5000, "Rate too high"); // Max %50
        annualInterestRate = newRate;
        emit InterestRateUpdated(newRate);
    }
    
    /**
     * @dev Kontrat adreslerini güncelle
     */
    function setContractAddresses(address _valuationOracle, address _rwaToken, address _rwaRegistry) external onlyOwner {
        valuationOracle = _valuationOracle;
        rwaToken = _rwaToken;
        rwaRegistry = _rwaRegistry;
    }
    
    /**
     * @dev Token kilitleme (internal) - token varlığını kontrol eder
     */
    function _lockToken(uint256 assetId) internal {
        (bool exists, ) = rwaToken.staticcall(
            abi.encodeWithSignature("ownerOf(uint256)", assetId)
        );
        require(exists, "Token does not exist");

        (bool success, ) = rwaToken.call(
            abi.encodeWithSignature("lockTokenByAuthority(uint256,address)", assetId, address(this))
        );
        require(success, "Token lock failed");
    }
    
    /**
     * @dev Token kilidini aç (internal)
     */
    function _unlockToken(uint256 assetId) internal {
        (bool success, ) = rwaToken.call(
            abi.encodeWithSignature("unlockTokenByAuthority(uint256)", assetId)
        );
        require(success, "Token unlock failed");
    }
    
    /**
     * @dev Kredi limiti sorgula (ValuationOracle'dan)
     *      Not: LTV oranı frontend tarafından uygulanır, kontrat ham oracle değerini döndürür
     *      (çifte LTV uygulamasını önlemek için)
     */
    function _getCreditLimit(uint256 assetId) internal view returns (uint256 limit, bool isValid) {
        (bool success, bytes memory data) = valuationOracle.staticcall(
            abi.encodeWithSignature("getAssetValuation(uint256)", assetId)
        );
        
        if (!success || data.length == 0) return (0, false);
        
        (uint256 value, bool valid) = abi.decode(data, (uint256, bool));
        if (!valid) return (0, false);
        
        limit = value; // Ham oracle değeri - LTV frontend tarafından uygulanır
        isValid = true;
    }
    
    /**
     * @dev Kontrat bakiyesi
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Fallback - ETH kabul et
     */
    receive() external payable {
        totalLiquidity += msg.value;
    }
}
