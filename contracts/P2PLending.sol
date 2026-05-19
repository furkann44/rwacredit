// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title P2PLending
 * @dev P2P borçlanma sistemi - Bireysel borç veren ve borç alan eþleþmesi
 */
contract P2PLending is Ownable, ReentrancyGuard, Pausable {
    
    // Teklif durumu
    enum OfferStatus { Active, Accepted, Cancelled, Expired }
    
    // Kredi durumu
    enum LoanStatus { Active, Repaid, Defaulted, Liquidated }
    
    // Temerrüt süresi
    uint256 public constant DEFAULT_PERIOD = 30 days;
    
    // Minimum/Maximum
    uint256 public constant MIN_LOAN_AMOUNT = 0.01 ether;
    uint256 public constant MAX_LOAN_AMOUNT = 50 ether;
    uint256 public constant MIN_INTEREST_RATE = 100;   // %1
    uint256 public constant MAX_INTEREST_RATE = 3000;  // %30
    uint256 public constant MAX_DURATION = 365 days;
    
    // Borç alma teklifi
    struct BorrowOffer {
        uint256 id;
        address borrower;
        uint256 assetId;
        uint256 requestedAmount;
        uint256 interestRate;     // Yýllýk faiz (basis points)
        uint256 duration;         // Vade (saniye)
        OfferStatus status;
        uint256 createdAt;
    }
    
    // Kredi kaydý
    struct Loan {
        uint256 id;
        uint256 offerId;
        address borrower;
        address lender;
        uint256 assetId;
        uint256 principal;
        uint256 interestRate;
        uint256 totalRepayment;
        uint256 amountRepaid;
        uint256 startTime;
        uint256 dueDate;
        LoanStatus status;
    }
    
    uint256 private _offerCounter;
    uint256 private _loanCounter;
    
    mapping(uint256 => BorrowOffer) public offers;
    mapping(uint256 => Loan) public loans;
    
    mapping(address => uint256[]) private _borrowerOffers;
    mapping(address => uint256[]) private _borrowerLoans;
    mapping(address => uint256[]) private _lenderLoans;
    
    // Aktif teklifler (frontend için)
    uint256[] public activeOfferIds;
    
    // Events
    event OfferCreated(
        uint256 offerId,
        address borrower,
        uint256 assetId,
        uint256 amount,
        uint256 interestRate,
        uint256 duration
    );
    
    event OfferCancelled(uint256 offerId);
    event OfferAccepted(uint256 offerId, uint256 loanId, address lender);
    event LoanRepaid(uint256 loanId, address borrower, uint256 amount);
    event LoanDefaulted(uint256 loanId, address borrower);
    
    /**
     * @dev Borç alma teklifi oluþtur
     */
    function createBorrowOffer(
        uint256 assetId,
        uint256 requestedAmount,
        uint256 interestRate,
        uint256 duration
    ) external whenNotPaused returns (uint256) {
        require(requestedAmount >= MIN_LOAN_AMOUNT, "Below minimum");
        require(requestedAmount <= MAX_LOAN_AMOUNT, "Above maximum");
        require(interestRate >= MIN_INTEREST_RATE && interestRate <= MAX_INTEREST_RATE, "Invalid interest rate");
        require(duration > 0 && duration <= MAX_DURATION, "Invalid duration");
        
        _offerCounter++;
        uint256 offerId = _offerCounter;
        
        offers[offerId] = BorrowOffer({
            id: offerId,
            borrower: msg.sender,
            assetId: assetId,
            requestedAmount: requestedAmount,
            interestRate: interestRate,
            duration: duration,
            status: OfferStatus.Active,
            createdAt: block.timestamp
        });
        
        _borrowerOffers[msg.sender].push(offerId);
        activeOfferIds.push(offerId);
        
        emit OfferCreated(offerId, msg.sender, assetId, requestedAmount, interestRate, duration);
        
        return offerId;
    }
    
    /**
     * @dev Teklifi iptal et
     */
    function cancelOffer(uint256 offerId) external whenNotPaused {
        BorrowOffer storage offer = offers[offerId];
        require(offer.borrower == msg.sender, "Not offer owner");
        require(offer.status == OfferStatus.Active, "Offer not active");
        
        offer.status = OfferStatus.Cancelled;
        _removeActiveOffer(offerId);
        
        emit OfferCancelled(offerId);
    }
    
    /**
     * @dev Teklifi kabul et ve kredi ver
     */
    function acceptOffer(uint256 offerId) external payable nonReentrant whenNotPaused returns (uint256) {
        BorrowOffer storage offer = offers[offerId];
        require(offer.status == OfferStatus.Active, "Offer not active");
        require(msg.sender != offer.borrower, "Cannot accept own offer");
        require(msg.value == offer.requestedAmount, "Incorrect amount");
        require(block.timestamp <= offer.createdAt + offer.duration, "Offer expired");
        
        // Teklifi kapat
        offer.status = OfferStatus.Accepted;
        _removeActiveOffer(offerId);
        
        // Kredi oluþtur
        _loanCounter++;
        uint256 loanId = _loanCounter;
        
        uint256 interest = (offer.requestedAmount * offer.interestRate) / 10000;
        uint256 totalRepayment = offer.requestedAmount + interest;
        
        loans[loanId] = Loan({
            id: loanId,
            offerId: offerId,
            borrower: offer.borrower,
            lender: msg.sender,
            assetId: offer.assetId,
            principal: offer.requestedAmount,
            interestRate: offer.interestRate,
            totalRepayment: totalRepayment,
            amountRepaid: 0,
            startTime: block.timestamp,
            dueDate: block.timestamp + offer.duration,
            status: LoanStatus.Active
        });
        
        _borrowerLoans[offer.borrower].push(loanId);
        _lenderLoans[msg.sender].push(loanId);
        
        // Token kilitle
        _lockToken(offer.assetId, address(this));
        
        // ETH transfer borç alana
        (bool success, ) = payable(offer.borrower).call{value: msg.value}("");
        require(success, "Transfer failed");
        
        emit OfferAccepted(offerId, loanId, msg.sender);
        
        return loanId;
    }
    
    /**
     * @dev Kredi geri öde
     */
    function repayLoan(uint256 loanId) external payable nonReentrant whenNotPaused {
        Loan storage loan = loans[loanId];
        require(loan.borrower == msg.sender, "Not borrower");
        require(loan.status == LoanStatus.Active, "Loan not active");
        
        uint256 remaining = loan.totalRepayment - loan.amountRepaid;
        require(msg.value >= remaining, "Insufficient payment");
        
        loan.amountRepaid += msg.value;
        
        // Fazla ödeme iade
        if (msg.value > remaining) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - remaining}("");
            require(success, "Refund failed");
        }
        
        // Kredi kapandý
        if (loan.amountRepaid >= loan.totalRepayment) {
            loan.status = LoanStatus.Repaid;
            _unlockToken(loan.assetId);
            
            // Borç verene ödeme (opsiyonel - zaten baþta gönderildi)
        }
        
        emit LoanRepaid(loanId, msg.sender, msg.value);
    }
    
    /**
     * @dev Temerrüt kontrolü
     */
    function checkDefault(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        require(loan.status == LoanStatus.Active, "Loan not active");
        require(block.timestamp > loan.dueDate, "Not due yet");
        
        loan.status = LoanStatus.Defaulted;
        
        emit LoanDefaulted(loanId, loan.borrower);
    }
    
    /**
     * @dev Aktif teklifleri getir
     */
    function getActiveOffers() external view returns (uint256[] memory) {
        return activeOfferIds;
    }
    
    /**
     * @dev Teklif detaylarýný getir
     */
    function getOffer(uint256 offerId) external view returns (
        uint256 id,
        address borrower,
        uint256 assetId,
        uint256 requestedAmount,
        uint256 interestRate,
        uint256 duration,
        OfferStatus status,
        uint256 createdAt
    ) {
        BorrowOffer memory o = offers[offerId];
        return (o.id, o.borrower, o.assetId, o.requestedAmount, o.interestRate, o.duration, o.status, o.createdAt);
    }
    
    /**
     * @dev Kredi detaylarýný getir
     */
    function getLoan(uint256 loanId) external view returns (
        uint256 id,
        uint256 offerId,
        address borrower,
        address lender,
        uint256 assetId,
        uint256 principal,
        uint256 interestRate,
        uint256 totalRepayment,
        uint256 amountRepaid,
        uint256 startTime,
        uint256 dueDate,
        LoanStatus status
    ) {
        Loan memory l = loans[loanId];
        return (l.id, l.offerId, l.borrower, l.lender, l.assetId, l.principal, l.interestRate, l.totalRepayment, l.amountRepaid, l.startTime, l.dueDate, l.status);
    }
    
    /**
     * @dev Güncel borç miktarý
     */
    function getCurrentDebt(uint256 loanId) external view returns (uint256) {
        Loan memory l = loans[loanId];
        if (l.status != LoanStatus.Active) return 0;
        
        uint256 elapsed = block.timestamp - l.startTime;
        uint256 accruedInterest = (l.principal * l.interestRate * elapsed) / (365 days * 10000);
        
        return l.principal + accruedInterest - l.amountRepaid;
    }
    
    /**
     * @dev Kullanýcýnýn borçlarýný getir
     */
    function getBorrowerLoans(address borrower) external view returns (uint256[] memory) {
        return _borrowerLoans[borrower];
    }
    
    /**
     * @dev Kullanýcýnýn verdiði kredileri getir
     */
    function getLenderLoans(address lender) external view returns (uint256[] memory) {
        return _lenderLoans[lender];
    }
    
    /**
     * @dev Token kilitle
     */
    function _lockToken(uint256 assetId, address authority) internal {
        // RWAToken kontratýna çaðrý
        // Bu fonksiyon deploy sonrasý set edilecek
    }
    
    /**
     * @dev Token kilidini aç
     */
    function _unlockToken(uint256 assetId) internal {
        // RWAToken kontratýna çaðrý
    }
    
    /**
     * @dev Aktif teklif listesinden çýkar
     */
    function _removeActiveOffer(uint256 offerId) internal {
        for (uint256 i = 0; i < activeOfferIds.length; i++) {
            if (activeOfferIds[i] == offerId) {
                activeOfferIds[i] = activeOfferIds[activeOfferIds.length - 1];
                activeOfferIds.pop();
                break;
            }
        }
    }
}
