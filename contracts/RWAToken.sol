// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract RWAToken is ERC721, ERC721URIStorage, Ownable, Pausable {
    uint256 private _tokenIdCounter;
    mapping(uint256 => bool) public isLocked;
    mapping(uint256 => address) public lockedBy;
    mapping(uint256 => string) private _tokenMetadata;
    address public authorizedRegistry;
    event TokenMinted(uint256 tokenId, address owner, string metadataUri);
    event TokenLocked(uint256 tokenId, address locker);
    event TokenUnlocked(uint256 tokenId);
    event RegistryUpdated(address newRegistry);
    constructor() ERC721("RWACredit", "RWAC") {}
    modifier onlyOwnerOrRegistry() {
        require(msg.sender == owner() || msg.sender == authorizedRegistry, "Not authorized");
        _;
    }
    function setRegistry(address registry) external onlyOwner {
        authorizedRegistry = registry;
        emit RegistryUpdated(registry);
    }
    function mint(address to, uint256 tokenId, string calldata metadataUri) external whenNotPaused returns (uint256) {
        require(_ownerOf(tokenId) == address(0), "Token ID already exists");
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataUri);
        _tokenMetadata[tokenId] = metadataUri;
        if (tokenId > _tokenIdCounter) _tokenIdCounter = tokenId;
        emit TokenMinted(tokenId, to, metadataUri);
        return tokenId;
    }
    function lockToken(uint256 tokenId) external whenNotPaused {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(!isLocked[tokenId], "Token already locked");
        isLocked[tokenId] = true;
        lockedBy[tokenId] = msg.sender;
        emit TokenLocked(tokenId, msg.sender);
    }
    function lockTokenByAuthority(uint256 tokenId, address authority) external {
        require(msg.sender == owner() || msg.sender == authorizedRegistry || msg.sender == authority, "Not authorized");
        require(!isLocked[tokenId], "Token already locked");
        isLocked[tokenId] = true;
        lockedBy[tokenId] = authority;
        emit TokenLocked(tokenId, authority);
    }
    function unlockToken(uint256 tokenId) external {
        require(isLocked[tokenId], "Token not locked");
        require(msg.sender == lockedBy[tokenId] || msg.sender == owner(), "Not authorized");
        isLocked[tokenId] = false;
        delete lockedBy[tokenId];
        emit TokenUnlocked(tokenId);
    }
    function unlockTokenByAuthority(uint256 tokenId) external {
        require(isLocked[tokenId], "Token not locked");
        require(msg.sender == lockedBy[tokenId] || msg.sender == owner() || msg.sender == authorizedRegistry, "Not authorized");
        isLocked[tokenId] = false;
        delete lockedBy[tokenId];
        emit TokenUnlocked(tokenId);
    }
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        require(!isLocked[tokenId], "Token is locked as collateral");
    }
    function setMetadata(uint256 tokenId, string calldata metadataUri) external onlyOwner {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        _tokenMetadata[tokenId] = metadataUri;
        _setTokenURI(tokenId, metadataUri);
    }
    function getTokenMetadata(uint256 tokenId) external view returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return _tokenMetadata[tokenId];
    }
    function getTotalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) { super._burn(tokenId); }
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) { return super.tokenURI(tokenId); }
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) { return super.supportsInterface(interfaceId); }
}
