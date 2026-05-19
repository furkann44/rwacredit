// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title ValuationOracle
 * @dev Hibrit degerleme sistemi - Otomatik formül + Manuel onay
 *      Web scraping API'den gelen veriler ile degerleme
 */
contract ValuationOracle is Ownable, Pausable {
    
    // Degerleme geçerlilik süresi (90 gün)
    uint256 public constant VALUATION_VALIDITY = 90 days;
    
    // LTV oranlari (basis points - 10000 = %100)
    uint256 public constant LTV_REAL_ESTATE = 7000;  // %70
    uint256 public constant LTV_VEHICLE = 5000;      // %50
    
    // Ilçe bazli m² fiyatlari (USD cinsinden - testnet)
    // Gerçek uygulamada bu veriler scraping API'den gelir
    mapping(string => uint256) public pricePerSqm;
    
    // Arac baz fiyatlari (USD cinsinden)
    mapping(string => uint256) public baseVehiclePrice;
    
    // Varsayilan fiyatlari (location key bulunamadiginda kullanilir)
    uint256 public defaultPricePerSqm = 1500;
    uint256 public defaultVehiclePrice = 30000;
    
    // Yetkili degerleyiciler
    mapping(address => bool) public authorizedValuators;
    
    // Degerleme kayitlari
    struct Valuation {
        uint256 id;
        uint256 assetId;
        uint256 estimatedValue;      // Otomatik tahmin
        uint256 manualValue;         // Manuel deger
        uint256 finalValue;          // Nihai deger
        uint256 timestamp;
        uint256 validUntil;
        address valuator;
        bool isApproved;
        string dataSource;           // "scraping", "manual", "hybrid"
        uint256 confidence;          // Güven skoru (1-100)
    }
    
    uint256 private _valuationCounter;
    mapping(uint256 => Valuation) public valuations;
    mapping(uint256 => uint256) public assetValuations; // assetId -> valuationId
    
    // Fiyat guncelleme zamani
    uint256 public lastPriceUpdate;
    uint256 public constant PRICE_UPDATE_INTERVAL = 1 days;
    
    event ValuationCreated(
        uint256 valuationId,
        uint256 assetId,
        uint256 estimatedValue,
        string dataSource
    );
    
    event ValuationApproved(
        uint256 valuationId,
        uint256 finalValue,
        address valuator
    );
    
    event PriceTableUpdated(string dataType, uint256 timestamp);
    
    modifier onlyValuator() {
        require(authorizedValuators[msg.sender] || msg.sender == owner(), "Not authorized valuator");
        _;
    }
    
    constructor() {
        authorizedValuators[msg.sender] = true;
        _initDefaultPrices();
    }
    
    /**
     * @dev Varsayilan fiyat tablolarini baslat (TUIK 2024 verileri baz alinmis)
     */
    function _initDefaultPrices() internal {
        // Gayrimenkul m² fiyatlari (USD) - Istanbul örnekleri
        pricePerSqm["Istanbul/Kadikoy"] = 4500;
        pricePerSqm["Istanbul/Besiktas"] = 5500;
        pricePerSqm["Istanbul/Uskudar"] = 3800;
        pricePerSqm["Istanbul/Bakirkoy"] = 4200;
        pricePerSqm["Ankara/Cankaya"] = 3200;
        pricePerSqm["Izmir/Bornova"] = 2800;
        pricePerSqm["Izmir/Karsiyaka"] = 2600;
        pricePerSqm["Antalya/Muratpasa"] = 2400;
        
        // Arac baz fiyatlari (USD)
        baseVehiclePrice["Toyota/Corolla"] = 35000;
        baseVehiclePrice["Honda/Civic"] = 38000;
        baseVehiclePrice["VW/Golf"] = 40000;
        baseVehiclePrice["BMW/3Series"] = 65000;
        baseVehiclePrice["Mercedes/CClass"] = 70000;
        baseVehiclePrice["Renault/Clio"] = 25000;
        baseVehiclePrice["Fiat/Egea"] = 22000;
        baseVehiclePrice["Hyundai/Tucson"] = 45000;
        
        lastPriceUpdate = block.timestamp;
    }
    
    /**
     * @dev Otomatik degerleme - Scraping API'den gelen veri ile
     */
    function estimateValue(
        uint256 assetId,
        bool isRealEstate,
        string calldata locationKey,  // "Istanbul/Kadikoy" veya "Toyota/Corolla"
        uint256 areaOrYear,          // Gayrimenkul: m², Arac: yil
        uint256 additionalParam      // Gayrimenkul: 0, Arac: km
    ) external whenNotPaused returns (uint256 valuationId) {
        uint256 estimatedValue;
        
        if (isRealEstate) {
            // Gayrimenkul degerleme
            uint256 pricePerSqmValue = pricePerSqm[locationKey];
            
            // Fiyat bulunamadiysa varsayilan fiyati kullan
            if (pricePerSqmValue == 0) {
                pricePerSqmValue = defaultPricePerSqm;
            }
            
            // Nitelik katsayilari
            uint256 multiplier = 100; // %100 baz
            
            estimatedValue = (areaOrYear * pricePerSqmValue * multiplier) / 100;
            
            // 18 decimal precision (drawCredit wei bazli karsilastirma yapar)
            estimatedValue = estimatedValue * 1e18;
        } else {
            // Arac degerleme
            string memory baseKey = locationKey;
            uint256 basePrice = baseVehiclePrice[baseKey];
            
            // Fiyat bulunamadiysa varsayilan fiyati kullan
            if (basePrice == 0) {
                basePrice = defaultVehiclePrice;
            }
            
            // Yas bazli depreciations (yillik %10)
            uint256 currentYear = (block.timestamp / 31536000) + 1970;
            uint256 age = currentYear - areaOrYear;
            uint256 ageDepreciation = age * 10; // %10 per year
            
            // KM bazli depreciation (her 100k km için %20)
            uint256 kmDepreciation = (additionalParam / 100000) * 20;
            
            uint256 totalDepreciation = ageDepreciation + kmDepreciation;
            if (totalDepreciation > 80) totalDepreciation = 80; // Max %80 depreciation
            
            estimatedValue = (basePrice * (100 - totalDepreciation)) / 100;
            estimatedValue = estimatedValue * 1e18;
        }
        
        _valuationCounter++;
        uint256 vid = _valuationCounter;
        
        valuations[vid] = Valuation({
            id: vid,
            assetId: assetId,
            estimatedValue: estimatedValue,
            manualValue: 0,
            finalValue: estimatedValue,
            timestamp: block.timestamp,
            validUntil: block.timestamp + VALUATION_VALIDITY,
            valuator: msg.sender,
            isApproved: true,
            dataSource: "scraping",
            confidence: 75
        });
        
        assetValuations[assetId] = vid;
        
        emit ValuationCreated(vid, assetId, estimatedValue, "scraping");
        emit ValuationApproved(vid, estimatedValue, msg.sender);
        
        return vid;
    }
    
    /**
     * @dev Manuel degerleme - Yetkili degerleyici
     */
    function submitManualValuation(
        uint256 assetId,
        uint256 manualValue,
        string memory dataSource
    ) external whenNotPaused returns (uint256 valuationId) {
        require(manualValue > 0, "Value must be greater than 0");
        
        // Varsa otomatik degerlemeyi kontrol et
        uint256 existingValId = assetValuations[assetId];
        uint256 autoValue = existingValId > 0 ? valuations[existingValId].estimatedValue : 0;
        
        // Manuel deger otomatik degerden çok farkliysa uyari (opsiyonel)
        uint256 finalValue = manualValue;
        uint256 confidence = 90; // Manuel degerleme daha güvenilir
        
        // Hybrid model: otomatik ve manuel ortalamasi
        if (autoValue > 0) {
            uint256 diff = manualValue > autoValue ? manualValue - autoValue : autoValue - manualValue;
            uint256 diffPercent = (diff * 100) / autoValue;
            
            if (diffPercent <= 20) {
                // %20 içindeyse ortalama al
                finalValue = (autoValue + manualValue) / 2;
                dataSource = "hybrid";
                confidence = 95;
            }
        }
        
        _valuationCounter++;
        uint256 vid = _valuationCounter;
        
        valuations[vid] = Valuation({
            id: vid,
            assetId: assetId,
            estimatedValue: autoValue,
            manualValue: manualValue,
            finalValue: finalValue,
            timestamp: block.timestamp,
            validUntil: block.timestamp + VALUATION_VALIDITY,
            valuator: msg.sender,
            isApproved: true,
            dataSource: dataSource,
            confidence: confidence
        });
        
        assetValuations[assetId] = vid;
        
        emit ValuationCreated(vid, assetId, finalValue, dataSource);
        emit ValuationApproved(vid, finalValue, msg.sender);
        
        return vid;
    }
    
    /**
     * @dev Kredi limiti hesapla (LTV orani ile)
     */
    function calculateCreditLimit(uint256 assetId, bool isRealEstate) external view returns (uint256) {
        uint256 valuationId = assetValuations[assetId];
        require(valuationId > 0, "No valuation found");
        
        Valuation memory v = valuations[valuationId];
        require(v.isApproved, "Valuation not approved");
        require(block.timestamp <= v.validUntil, "Valuation expired");
        
        uint256 ltv = isRealEstate ? LTV_REAL_ESTATE : LTV_VEHICLE;
        
        return (v.finalValue * ltv) / 10000;
    }
    
    /**
     * @dev Degerleme bilgilerini getir
     */
    function getValuation(uint256 valuationId) external view returns (
        uint256 id,
        uint256 assetId,
        uint256 estimatedValue,
        uint256 manualValue,
        uint256 finalValue,
        uint256 timestamp,
        uint256 validUntil,
        address valuator,
        bool isApproved,
        string memory dataSource,
        uint256 confidence
    ) {
        Valuation memory v = valuations[valuationId];
        return (
            v.id,
            v.assetId,
            v.estimatedValue,
            v.manualValue,
            v.finalValue,
            v.timestamp,
            v.validUntil,
            v.valuator,
            v.isApproved,
            v.dataSource,
            v.confidence
        );
    }
    
    /**
     * @dev Fiyat tablolarini guncelle (scraping API'den)
     */
    function updatePriceTable(
        string calldata dataType,
        string[] calldata keys,
        uint256[] calldata prices
    ) external onlyOwner {
        require(keys.length == prices.length, "Length mismatch");
        
        for (uint256 i = 0; i < keys.length; i++) {
            if (keccak256(bytes(dataType)) == keccak256(bytes("realestate"))) {
                pricePerSqm[keys[i]] = prices[i];
            } else if (keccak256(bytes(dataType)) == keccak256(bytes("vehicle"))) {
                baseVehiclePrice[keys[i]] = prices[i];
            }
        }
        
        lastPriceUpdate = block.timestamp;
        emit PriceTableUpdated(dataType, block.timestamp);
    }
    
    /**
     * @dev Varsayilan fiyatlari guncelle
     */
    function setDefaultPrices(uint256 newDefaultPricePerSqm, uint256 newDefaultVehiclePrice) external onlyOwner {
        require(newDefaultPricePerSqm > 0, "Invalid price");
        require(newDefaultVehiclePrice > 0, "Invalid price");
        defaultPricePerSqm = newDefaultPricePerSqm;
        defaultVehiclePrice = newDefaultVehiclePrice;
    }
    
    /**
     * @dev Yetkili degerleyici ekle/çıkar
     */
    function setValuator(address valuator, bool authorized) external onlyOwner {
        authorizedValuators[valuator] = authorized;
    }
    
    /**
     * @dev Varligin geçerli degerlemesini getir
     */
    function getAssetValuation(uint256 assetId) external view returns (uint256 finalValue, bool isValid) {
        uint256 valuationId = assetValuations[assetId];
        if (valuationId == 0) return (0, false);
        
        Valuation memory v = valuations[valuationId];
        isValid = v.isApproved && block.timestamp <= v.validUntil;
        finalValue = v.finalValue;
    }
}
