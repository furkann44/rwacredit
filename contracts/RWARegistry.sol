// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title RWARegistry
 * @dev T�rkiye RWA varl�k kay�t sistemi - Gayrimenkul ve Ara�
 */
contract RWARegistry is Ownable, ReentrancyGuard, Pausable {
    
    // Varl�k tipleri
    enum AssetType { RealEstate, Vehicle }
    
    // Varl�k durumu
    enum AssetStatus { Pending, Valued, Locked, Liquidated, Released }
    
    // Gayrimenkul niteli�i
    enum PropertyType { Residence, Commercial, Land, Farm }
    
    // Tapu t�r�
    enum TitleDeedType { FullOwnership, Condominium, Easement }
    
    // T�rkiye illeri (81 il - sadece �rnekler)
    enum City {
        Adana, Adiyaman, Afyonkarahisar, Agri, Amasya, Ankara, Antalya, Artvin,
        Aydin, Balikesir, Bilecik, Bingol, Bitlis, Bolu, Burdur, Bursa,
        Canakkale, Cankiri, Corum, Denizli, Diyarbakir, Edirne, Elazig, Erzincan,
        Erzurum, Eskisehir, Gaziantep, Giresun, Gumushane, Hakkari, Hatay, Isparta,
        Mersin, Istanbul, Izmir, Kars, Kastamonu, Kayseri, Kirklareli, Kirsehir,
        Kocaeli, Konya, Kutahya, Malatya, Manisa, Kahramanmaras, Mardin, Mugla,
        Mus, Nevsehir, Nigde, Ordu, Rize, Sakarya, Samsun, Siirt, Sinop,
        Sivas, Tekirdag, Tokat, Trabzon, Tunceli, Sanliurfa, Usak, Van,
        Yozgat, Zonguldak, Aksaray, Bayburt, Karaman, Kirikkale, Batman, Sirnak,
        Bartin, Ardahan, Igdir, Yalova, Karabuk, Kilis, Osmaniye, Duzce
    }
    
    // Gayrimenkul bilgileri
    struct RealEstateInfo {
        City city;
        string district;
        string neighborhood;
        uint256 plotNumber;      // Ada
        uint256 parcelNumber;    // Parsel
        uint256 area;            // m�
        PropertyType propertyType;
        TitleDeedType titleDeedType;
        string locationInfo;
    }
    
    // Ara� bilgileri
    struct VehicleInfo {
        string plate;            // Plaka (�rn: 34ABC123)
        string chassisNumber;    // �asi no
        string brand;
        string model;
        uint256 year;
        uint256 mileage;         // KM
        string fuelType;         // Benzin, Dizel, Hybrid, Elektrik
    }
    
    // Ana varl�k yap�s�
    struct Asset {
        uint256 id;
        AssetType assetType;
        AssetStatus status;
        address owner;
        uint256 createdAt;
        uint256 valuationId;
        uint256 creditId;
        // Veri
        RealEstateInfo realEstate;
        VehicleInfo vehicle;
    }
    
    // State
    uint256 private _assetCounter;
    mapping(uint256 => Asset) public assets;
    mapping(address => uint256[]) private _userAssets;
    
    // Events
    event AssetRegistered(
        uint256 assetId,
        address owner,
        AssetType assetType,
        AssetStatus status
    );
    
    event AssetStatusChanged(
        uint256 assetId,
        AssetStatus oldStatus,
        AssetStatus newStatus
    );
    
    event ValuationLinked(uint256 assetId, uint256 valuationId);
    
    /**
     * @dev Gayrimenkul kaydet
     */
    function registerRealEstate(
        uint8 city,
        string calldata district,
        string calldata neighborhood,
        uint256 plotNumber,
        uint256 parcelNumber,
        uint256 area,
        uint8 propertyType,
        uint8 titleDeedType,
        string calldata locationData
    ) external whenNotPaused returns (uint256) {
        require(area > 0, "Area must be greater than 0");
        require(propertyType <= 3, "Invalid property type");
        require(titleDeedType <= 2, "Invalid title deed type");
        
        _assetCounter++;
        uint256 assetId = _assetCounter;
        
        assets[assetId] = Asset({
            id: assetId,
            assetType: AssetType.RealEstate,
            status: AssetStatus.Pending,
            owner: msg.sender,
            createdAt: block.timestamp,
            valuationId: 0,
            creditId: 0,
            realEstate: RealEstateInfo({
                city: City(city),
                district: district,
                neighborhood: neighborhood,
                plotNumber: plotNumber,
                parcelNumber: parcelNumber,
                area: area,
                propertyType: PropertyType(propertyType),
                titleDeedType: TitleDeedType(titleDeedType),
                locationInfo: locationData
            }),
            vehicle: VehicleInfo("", "", "", "", 0, 0, "")
        });
        
        _userAssets[msg.sender].push(assetId);
        
        emit AssetRegistered(assetId, msg.sender, AssetType.RealEstate, AssetStatus.Pending);
        
        return assetId;
    }
    
    /**
     * @dev Ara� kaydet
     */
    function registerVehicle(
        string calldata plate,
        string calldata chassisNumber,
        string calldata brand,
        string calldata model,
        uint256 year,
        uint256 mileage,
        string calldata fuelType
    ) external whenNotPaused returns (uint256) {
        require(bytes(plate).length > 0, "Plate required");
        require(bytes(chassisNumber).length > 0, "Chassis number required");
        require(year >= 1990 && year <= block.timestamp / 31536000 + 1970, "Invalid year");
        
        _assetCounter++;
        uint256 assetId = _assetCounter;
        
        assets[assetId] = Asset({
            id: assetId,
            assetType: AssetType.Vehicle,
            status: AssetStatus.Pending,
            owner: msg.sender,
            createdAt: block.timestamp,
            valuationId: 0,
            creditId: 0,
            realEstate: RealEstateInfo(City(0), "", "", 0, 0, 0, PropertyType(0), TitleDeedType(0), ""),
            vehicle: VehicleInfo({
                plate: plate,
                chassisNumber: chassisNumber,
                brand: brand,
                model: model,
                year: year,
                mileage: mileage,
                fuelType: fuelType
            })
        });
        
        _userAssets[msg.sender].push(assetId);
        
        emit AssetRegistered(assetId, msg.sender, AssetType.Vehicle, AssetStatus.Pending);
        
        return assetId;
    }
    
    /**
     * @dev Değerleme bağlantısı
     */
    function linkValuation(uint256 assetId, uint256 valuationId) external {
        require(assets[assetId].owner != address(0), "Asset does not exist");
        require(assets[assetId].owner == msg.sender, "Not asset owner");
        require(assets[assetId].status == AssetStatus.Pending, "Asset not pending");
        
        assets[assetId].valuationId = valuationId;
        assets[assetId].status = AssetStatus.Valued;
        
        emit ValuationLinked(assetId, valuationId);
        emit AssetStatusChanged(assetId, AssetStatus.Pending, AssetStatus.Valued);
    }

    function linkCredit(uint256 assetId, uint256 creditId) external {
        require(assets[assetId].owner != address(0), "Asset does not exist");
        require(assets[assetId].status != AssetStatus.Liquidated, "Asset liquidated");
        
        AssetStatus oldStatus = assets[assetId].status;
        assets[assetId].creditId = creditId;
        assets[assetId].status = AssetStatus.Locked;
        
        emit AssetStatusChanged(assetId, oldStatus, AssetStatus.Locked);
    }
    
    /**
     * @dev Varl�k durumunu de�i�tir
     */
    function changeAssetStatus(uint256 assetId, AssetStatus newStatus) external onlyOwner {
        require(assets[assetId].owner != address(0), "Asset does not exist");
        
        AssetStatus oldStatus = assets[assetId].status;
        assets[assetId].status = newStatus;
        
        emit AssetStatusChanged(assetId, oldStatus, newStatus);
    }
    
    /**
     * @dev Kullan�c�n�n varl�klar�n� getir
     */
    function getUserAssets(address user) external view returns (uint256[] memory) {
        return _userAssets[user];
    }
    
    /**
     * @dev Varl�k bilgilerini getir
     */
    function getAsset(uint256 assetId) external view returns (
        uint256 id,
        AssetType assetType,
        AssetStatus status,
        address owner,
        uint256 createdAt,
        uint256 valuationId,
        uint256 creditId
    ) {
        Asset memory asset = assets[assetId];
        require(asset.owner != address(0), "Asset does not exist");
        
        return (
            asset.id,
            asset.assetType,
            asset.status,
            asset.owner,
            asset.createdAt,
            asset.valuationId,
            asset.creditId
        );
    }
    
    /**
     * @dev Varl�k say�s�n� getir
     */
    function getAssetCounter() external view returns (uint256) {
        return _assetCounter;
    }
    
    /**
     * @dev Kontrat� duraklat
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Kontrat� devam ettir
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
