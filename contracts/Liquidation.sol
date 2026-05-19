// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title Liquidation
 * @dev Temerrüt durumunda varlýk tasfiyesi - Açýk artýrma ile satýþ
 */
contract Liquidation is Ownable, ReentrancyGuard, Pausable {
    
    // Açýk artýrma durumu
    enum AuctionStatus { Active, Sold, Cancelled, Failed }
    
    // Açýk artýrma süresi
    uint256 public constant AUCTION_DURATION = 7 days;
    
    // Minimum artýþ (%)
    uint256 public constant MIN_BID_INCREMENT = 500; // %5
    
    // Ceza faizi (%)
    uint256 public constant PENALTY_RATE = 1000; // %10
    
    // Açýk artýrma kaydý
    struct Auction {
        uint256 id;
        uint256 assetId;
        uint256 creditId;
        address borrower;
        address lender;
        uint256 debtAmount;
        uint256 startingPrice;
        uint256 highestBid;
        address highestBidder;
        uint256 startTime;
        uint256 endTime;
        AuctionStatus status;
    }
    
    uint256 private _auctionCounter;
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => uint256) public assetAuctions; // assetId -> auctionId
    
    // Kredi kontratý adresi
    address public creditPool;
    address public p2pLending;
    address public rwaToken;
    
    // Events
    event AuctionCreated(
        uint256 auctionId,
        uint256 assetId,
        uint256 startingPrice,
        uint256 endTime
    );
    
    event BidPlaced(uint256 auctionId, address bidder, uint256 amount);
    event AuctionEnded(uint256 auctionId, uint256 assetId, address winner, uint256 amount);
    event AuctionCancelled(uint256 auctionId);
    
    modifier onlyCreditPool() {
        require(msg.sender == creditPool, "Not credit pool");
        _;
    }
    
    modifier onlyP2PLending() {
        require(msg.sender == p2pLending, "Not P2P lending");
        _;
    }
    
    constructor(address _creditPool, address _p2pLending, address _rwaToken) {
        creditPool = _creditPool;
        p2pLending = _p2pLending;
        rwaToken = _rwaToken;
    }
    
    /**
     * @dev Açýk artýrma baþlat
     */
    function createAuction(
        uint256 assetId,
        uint256 creditId,
        address borrower,
        address lender,
        uint256 debtAmount,
        uint256 startingPrice
    ) external whenNotPaused returns (uint256) {
        require(startingPrice > 0, "Starting price must be > 0");
        
        _auctionCounter++;
        uint256 auctionId = _auctionCounter;
        
        auctions[auctionId] = Auction({
            id: auctionId,
            assetId: assetId,
            creditId: creditId,
            borrower: borrower,
            lender: lender,
            debtAmount: debtAmount,
            startingPrice: startingPrice,
            highestBid: 0,
            highestBidder: address(0),
            startTime: block.timestamp,
            endTime: block.timestamp + AUCTION_DURATION,
            status: AuctionStatus.Active
        });
        
        assetAuctions[assetId] = auctionId;
        
        emit AuctionCreated(auctionId, assetId, startingPrice, block.timestamp + AUCTION_DURATION);
        
        return auctionId;
    }
    
    /**
     * @dev Teklif ver
     */
    function placeBid(uint256 auctionId) external payable nonReentrant whenNotPaused {
        Auction storage auction = auctions[auctionId];
        require(auction.status == AuctionStatus.Active, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        
        // Minimum teklif kontrolü
        uint256 minBid = auction.highestBid > 0 
            ? auction.highestBid + (auction.highestBid * MIN_BID_INCREMENT) / 10000
            : auction.startingPrice;
        
        require(msg.value >= minBid, "Bid too low");
        
        // Önceki teklif sahibine iade
        if (auction.highestBidder != address(0)) {
            (bool success, ) = payable(auction.highestBidder).call{value: auction.highestBid}("");
            require(success, "Refund failed");
        }
        
        // Yeni teklif
        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;
        
        emit BidPlaced(auctionId, msg.sender, msg.value);
    }
    
    /**
     * @dev Açýk artýrmayý bitir
     */
    function endAuction(uint256 auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.status == AuctionStatus.Active, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction not ended");
        
        if (auction.highestBidder == address(0)) {
            // Teklif yok - baþarýsýz
            auction.status = AuctionStatus.Failed;
            return;
        }
        
        auction.status = AuctionStatus.Sold;
        
        // NFT'yi kazanan transfer et
        _transferToken(auction.assetId, auction.highestBidder);
        
        // Gelir daðýlýmý
        // 1. Borç miktarý + ceza faizi lender'a
        uint256 penalty = (auction.debtAmount * PENALTY_RATE) / 10000;
        uint256 lenderAmount = auction.debtAmount + penalty;
        uint256 surplus = auction.highestBid > lenderAmount ? auction.highestBid - lenderAmount : 0;
        
        // Lender'a ödeme
        if (lenderAmount > 0) {
            (bool success, ) = payable(auction.lender).call{value: lenderAmount}("");
            require(success, "Lender payment failed");
        }
        
        // Artan miktar borç alana iade
        if (surplus > 0) {
            (bool success, ) = payable(auction.borrower).call{value: surplus}("");
            require(success, "Borrower refund failed");
        }
        
        // Kredi kontratýný bilgilendir
        _notifyCreditPool(auction.creditId);
        
        emit AuctionEnded(auctionId, auction.assetId, auction.highestBidder, auction.highestBid);
    }
    
    /**
     * @dev Açýk artýrmayý iptal et (sadece owner)
     */
    function cancelAuction(uint256 auctionId) external onlyOwner {
        Auction storage auction = auctions[auctionId];
        require(auction.status == AuctionStatus.Active, "Auction not active");
        
        // Teklif varsa iade
        if (auction.highestBidder != address(0)) {
            (bool success, ) = payable(auction.highestBidder).call{value: auction.highestBid}("");
            require(success, "Refund failed");
        }
        
        auction.status = AuctionStatus.Cancelled;
        
        emit AuctionCancelled(auctionId);
    }
    
    /**
     * @dev Açýk artýrma bilgilerini getir
     */
    function getAuction(uint256 auctionId) external view returns (
        uint256 id,
        uint256 assetId,
        uint256 creditId,
        address borrower,
        address lender,
        uint256 debtAmount,
        uint256 startingPrice,
        uint256 highestBid,
        address highestBidder,
        uint256 startTime,
        uint256 endTime,
        AuctionStatus status
    ) {
        Auction memory a = auctions[auctionId];
        return (
            a.id, a.assetId, a.creditId, a.borrower, a.lender,
            a.debtAmount, a.startingPrice, a.highestBid, a.highestBidder,
            a.startTime, a.endTime, a.status
        );
    }
    
    /**
     * @dev Minimum teklif miktarý
     */
    function getMinBid(uint256 auctionId) external view returns (uint256) {
        Auction memory a = auctions[auctionId];
        if (a.highestBid > 0) {
            return a.highestBid + (a.highestBid * MIN_BID_INCREMENT) / 10000;
        }
        return a.startingPrice;
    }
    
    /**
     * @dev Kontrat adreslerini güncelle
     */
    function setContractAddresses(address _creditPool, address _p2pLending, address _rwaToken) external onlyOwner {
        creditPool = _creditPool;
        p2pLending = _p2pLending;
        rwaToken = _rwaToken;
    }
    
    /**
     * @dev Token transfer (internal)
     */
    function _transferToken(uint256 assetId, address to) internal {
        // RWAToken kontratýna çaðrý
        (bool success, ) = rwaToken.call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", address(this), to, assetId)
        );
        require(success, "Token transfer failed");
    }
    
    /**
     * @dev Kredi kontratýný bilgilendir
     */
    function _notifyCreditPool(uint256 creditId) internal {
        // CreditPool kontratýna çaðrý
        (bool success, ) = creditPool.call(
            abi.encodeWithSignature("markAsLiquidated(uint256)", creditId)
        );
        // Baþarýsýz olabilir, revert etme
    }
}
