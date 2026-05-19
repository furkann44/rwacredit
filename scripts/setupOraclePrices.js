const hre = require("hardhat");

// Türkçe karakterleri ASCII'ye dönüştür
function normalizeKey(key) {
  return key
    .replace(/İ/g, 'I').replace(/ı/g, 'i')
    .replace(/Ş/g, 'S').replace(/ş/g, 's')
    .replace(/Ğ/g, 'G').replace(/ğ/g, 'g')
    .replace(/Ü/g, 'U').replace(/ü/g, 'u')
    .replace(/Ö/g, 'O').replace(/ö/g, 'o')
    .replace(/Ç/g, 'C').replace(/ç/g, 'c');
}

async function main() {
  console.log("Oracle fiyat verileri kuruluyor...");

  const ValuationOracle = await hre.ethers.getContractFactory("ValuationOracle");
  const oracleAddress = process.env.ORACLE_ADDRESS || "0xe9713875521cCA580FE47790cc081e79Feda1FB2";
  const oracle = ValuationOracle.attach(oracleAddress);

  // Gayrimenkul fiyatları (m² başına USD)
  const realestateKeys = [
    // İstanbul
    "Istanbul/Adalar", "Istanbul/Arnavutkoy", "Istanbul/Atasehir", "Istanbul/Avcilar",
    "Istanbul/Bagcilar", "Istanbul/Bahcelievler", "Istanbul/Bakirkoy", "Istanbul/Basaksehir",
    "Istanbul/Bayrampasa", "Istanbul/Besiktas", "Istanbul/Beykoz", "Istanbul/Beylikduzu",
    "Istanbul/Beyoglu", "Istanbul/Buyukcekmece", "Istanbul/Catalca", "Istanbul/Cekmekoy",
    "Istanbul/Esenler", "Istanbul/Esenyurt", "Istanbul/Eyupsultan", "Istanbul/Fatih",
    "Istanbul/Gaziosmanpasa", "Istanbul/Gungoren", "Istanbul/Kadikoy", "Istanbul/Kagithane",
    "Istanbul/Kartal", "Istanbul/Kucukcekmece", "Istanbul/Maltepe", "Istanbul/Pendik",
    "Istanbul/Sancaktepe", "Istanbul/Sariyer", "Istanbul/Silivri", "Istanbul/Sultanbeyli",
    "Istanbul/Sultangazi", "Istanbul/Sile", "Istanbul/Tuzla", "Istanbul/Umraniye",
    "Istanbul/Uskudar", "Istanbul/Zeytinburnu",
    // Ankara
    "Ankara/Akyurt", "Ankara/Altindag", "Ankara/Ayash", "Ankara/Bala",
    "Ankara/Beypazari", "Ankara/Camlidere", "Ankara/Cankaya", "Ankara/Cubuk",
    "Ankara/Elmadag", "Ankara/Etimesgut", "Ankara/Evren", "Ankara/Golbasi",
    "Ankara/Gudul", "Ankara/Haymana", "Ankara/Kahramankazan", "Ankara/Kalecik",
    "Ankara/Keccioren", "Ankara/Kizilcahamam", "Ankara/Mamak", "Ankara/Nallihan",
    "Ankara/Pursaklar", "Ankara/Polatli", "Ankara/Sincan", "Ankara/Yenimahalle",
    // İzmir
    "Izmir/Aliağa", "Izmir/Balçova", "Izmir/Bayındır", "Izmir/Bayraklı",
    "Izmir/Bergama", "Izmir/Beydağ", "Izmir/Bornova", "Izmir/Buca",
    "Izmir/Çeşme", "Izmir/Çiğli", "Izmir/Dikili", "Izmir/Foça",
    "Izmir/Gaziemir", "Izmir/Güzelbahçe", "Izmir/Karabağlar", "Izmir/Karaburun",
    "Izmir/Karşıyaka", "Izmir/Kemalpaşa", "Izmir/Kınık", "Izmir/Kiraz",
    "Izmir/Konak", "Izmir/Menderes", "Izmir/Menemen", "Izmir/Narlıdere",
    "Izmir/Ödemiş", "Izmir/Seferihisar", "Izmir/Selçuk", "Izmir/Tire",
    "Izmir/Torbalı", "Izmir/Urla",
    // Antalya
    "Antalya/Akseki", "Antalya/Aksu", "Antalya/Alanya", "Antalya/Demre",
    "Antalya/Dosemealti", "Antalya/Elmali", "Antalya/Finike", "Antalya/Gazipasa",
    "Antalya/Gundogmus", "Antalya/Ibradi", "Antalya/Kale", "Antalya/Kas",
    "Antalya/Kemer", "Antalya/Kepez", "Antalya/Konyaalti", "Antalya/Korkuteli",
    "Antalya/Kumluca", "Antalya/Manavgat", "Antalya/Muratpasa", "Antalya/Serik",
    // Diğer büyük şehirler
    "Bursa/Gemlik", "Bursa/Gursu", "Bursa/Inegol", "Bursa/Iznik",
    "Bursa/Karacabey", "Bursa/Keles", "Bursa/Kestel", "Bursa/Mudanya",
    "Bursa/Mustafakemalpasa", "Bursa/Nilüfer", "Bursa/Osmangazi", "Bursa/Orhaneli",
    "Bursa/Orhangazi", "Bursa/Yenishehir", "Bursa/Yildirim",
    "Adana/Aladag", "Adana/Ceyhan", "Adana/Cukurova", "Adana/Feke",
    "Adana/Imamoglu", "Adana/Karaisali", "Adana/Karatas", "Adana/Kozan",
    "Adana/Pozanti", "Adana/Saimbeyli", "Adana/Sarıçam", "Adana/Seyhan",
    "Adana/Tufanbeyli", "Adana/Yumurtalık", "Adana/Yuregir",
    "Konya/Ahirli", "Konya/Aksehir", "Konya/Akoren", "Konya/Aksaray",
    "Konya/Altınekin", "Konya/Beysehir", "Konya/Bozkır", "Konya/Cihanbeyli",
    "Konya/Çeltik", "Konya/Çumra", "Konya/Derebucak", "Konya/Doğanhisar",
    "Konya/Emirgazi", "Konya/Ereğli", "Konya/Güneysınır", "Konya/Hadim",
    "Konya/Halkapınar", "Konya/Hüyük", "Konya/Ilgın", "Konya/Kadınhanı",
    "Konya/Karatay", "Konya/Kulu", "Konya/Meram", "Konya/Sarayönü",
    "Konya/Selçuklu", "Konya/Seydişehir", "Konya/Taşkent", "Konya/Tuzlukçu",
    "Konya/Yalıhüyük", "Konya/Yunak",
    // Malatya
    "Malatya/Akçadağ", "Malatya/Arapgir", "Malatya/Arguvan", "Malatya/Battalgazi",
    "Malatya/Darende", "Malatya/Doğanşehir", "Malatya/Doğanyol", "Malatya/Hekimhan",
    "Malatya/Kale", "Malatya/Kuluncak", "Malatya/Pütürge", "Malatya/Yazıhan",
    "Malatya/Yeşilyurt",
    // Diğer iller (örnek ilçeler)
    "Gaziantep/Şahinbey", "Gaziantep/Şehitkamil", "Gaziantep/Nizip",
    "Kocaeli/İzmit", "Kocaeli/Gebze", "Kocaeli/Darıca",
    "Diyarbakır/Bağlar", "Diyarbakır/Kayapınar", "Diyarbakır/Sur",
    "Mersin/Akdeniz", "Mersin/Mezitli", "Mersin/Toroslar", "Mersin/Yenişehir",
    "Kayseri/Melikgazi", "Kayseri/Kocasinan", "Kayseri/Talas",
    "Eskişehir/Tepebaşı", "Eskişehir/Odunpazarı",
    "Trabzon/Ortahisar", "Trabzon/Akçaabat",
    "Samsun/İlkadım", "Samsun/Atakum", "Samsun/Canik",
    "Balıkesir/Altıeylül", "Balıkesir/Karesi",
    "Kahramanmaraş/Dulkadiroğlu", "Kahramanmaraş/Onikişubat",
    "Van/İpekyolu", "Van/Tuşba", "Van/Edremit",
    "Aydın/Efeler", "Aydın/Didim", "Aydın/Kuşadası",
    "Muğla/Bodrum", "Muğla/Fethiye", "Muğla/Marmaris", "Muğla/Seydikemer",
    "Denizli/Pamukkale", "Denizli/Merkezefendi",
    "Tekirdağ/Süleymanpaşa", "Tekirdağ/Çerkezköy", "Tekirdağ/Çorlu",
    "Manisa/Yunusemre", "Manisa/Şehzadeler",
    "Hatay/Antakya", "Hatay/Defne", "Hatay/İskenderun",
    "Erzurum/Yakutiye", "Erzurum/Palandöken", "Erzurum/Aziziye",
    "Mardin/Artuklu", "Mardin/Kızıltepe",
    "Sakarya/Adapazarı", "Sakarya/Serdivan",
    "Aksaray/Merkez", "Kütahya/Merkez", "Afyonkarahisar/Merkez",
    "Isparta/Merkez", "Uşak/Merkez", "Bolu/Merkez", "Düzce/Merkez",
    "Edirne/Merkez", "Kırklareli/Merkez", "Tekirdağ/Merkez",
    "Çanakkale/Merkez", "Balıkesir/Merkez", "Bursa/Merkez",
    "Yalova/Merkez", "Kocaeli/Merkez", "İstanbul/Merkez",
    "İzmir/Merkez", "Manisa/Merkez", "Aydın/Merkez",
    "Muğla/Merkez", "Antalya/Merkez", "Burdur/Merkez",
    "Isparta/Merkez", "Konya/Merkez", "Karaman/Merkez",
    "Aksaray/Merkez", "Nevşehir/Merkez", "Niğde/Merkez",
    "Kayseri/Merkez", "Sivas/Merkez", "Yozgat/Merkez",
    "Kırşehir/Merkez", "Kırıkkale/Merkez", "Ankara/Merkez",
    "Çankırı/Merkez", "Kastamonu/Merkez", "Sinop/Merkez",
    "Ordu/Merkez", "Giresun/Merkez", "Trabzon/Merkez",
    "Rize/Merkez", "Artvin/Merkez", "Gümüşhane/Merkez",
    "Bayburt/Merkez", "Erzincan/Merkez", "Erzurum/Merkez",
    "Ağrı/Merkez", "Kars/Merkez", "Iğdır/Merkez",
    "Ardahan/Merkez", "Muş/Merkez", "Bitlis/Merkez",
    "Van/Merkez", "Hakkari/Merkez", "Şırnak/Merkez",
    "Mardin/Merkez", "Batman/Merkez", "Siirt/Merkez",
    "Diyarbakır/Merkez", "Şanlıurfa/Merkez", "Adıyaman/Merkez",
    "Gaziantep/Merkez", "Kilis/Merkez", "Hatay/Merkez",
    "Osmaniye/Merkez", "Kahramanmaraş/Merkez", "Adana/Merkez",
    "Mersin/Merkez", "Konya/Merkez", "Karaman/Merkez",
    "Aksaray/Merkez", "Nevşehir/Merkez", "Niğde/Merkez",
    "Kayseri/Merkez", "Sivas/Merkez", "Yozgat/Merkez",
    "Kırşehir/Merkez", "Kırıkkale/Merkez", "Ankara/Merkez",
    "Çankırı/Merkez", "Kastamonu/Merkez", "Sinop/Merkez",
    "Ordu/Merkez", "Giresun/Merkez", "Trabzon/Merkez",
    "Rize/Merkez", "Artvin/Merkez", "Gümüşhane/Merkez",
    "Bayburt/Merkez", "Erzincan/Merkez", "Erzurum/Merkez",
    "Ağrı/Merkez", "Kars/Merkez", "Iğdır/Merkez",
    "Ardahan/Merkez", "Muş/Merkez", "Bitlis/Merkez",
    "Van/Merkez", "Hakkari/Merkez", "Şırnak/Merkez",
    "Mardin/Merkez", "Batman/Merkez", "Siirt/Merkez",
    "Diyarbakır/Merkez", "Şanlıurfa/Merkez", "Adıyaman/Merkez",
    "Gaziantep/Merkez", "Kilis/Merkez", "Hatay/Merkez",
    "Osmaniye/Merkez", "Kahramanmaraş/Merkez", "Adana/Merkez",
    "Mersin/Merkez",
  ];

  const realestatePrices = realestateKeys.map(() => 1500); // Varsayılan 1500 USD/m²

  // Araç fiyatları (USD) - Türkiye'de satılan modeller
  const vehicleKeys = [
    "Alfa Romeo/Giulia", "Alfa Romeo/Stelvio", "Alfa Romeo/Tonale",
    "Audi/A1", "Audi/A3", "Audi/A4", "Audi/A5", "Audi/A6",
    "Audi/Q3", "Audi/Q5", "Audi/Q7", "Audi/e-tron",
    "BMW/1 Serisi", "BMW/3 Serisi", "BMW/4 Serisi", "BMW/5 Serisi", "BMW/7 Serisi",
    "BMW/X1", "BMW/X3", "BMW/X5", "BMW/X6", "BMW/i4", "BMW/iX", "BMW/Z4",
    "BYD/Atto 3", "BYD/Han", "BYD/Tang", "BYD/Dolphin", "BYD/Seal",
    "Chery/Tiggo 7", "Chery/Tiggo 8", "Chery/Omoda 5",
    "Citroen/C3", "Citroen/C4", "Citroen/C5", "Citroen/C3 Aircross",
    "Citroen/C5 Aircross", "Citroen/Berlingo",
    "Cupra/Leon", "Cupra/Formentor", "Cupra/Born", "Cupra/Ateca",
    "Dacia/Duster", "Dacia/Sandero", "Dacia/Logan", "Dacia/Jogger", "Dacia/Spring",
    "DS/DS 3", "DS/DS 4", "DS/DS 7",
    "Fiat/Egea", "Fiat/500", "Fiat/500X", "Fiat/Panda", "Fiat/Tipo",
    "Fiat/Doblo", "Fiat/Fiorino",
    "Ford/Focus", "Ford/Fiesta", "Ford/Kuga", "Ford/Puma", "Ford/Mondeo",
    "Ford/Ranger", "Ford/EcoSport", "Ford/Transit",
    "Honda/Civic", "Honda/CR-V", "Honda/HR-V", "Honda/Jazz", "Honda/City",
    "Hyundai/i10", "Hyundai/i20", "Hyundai/i30", "Hyundai/Accent", "Hyundai/Elantra",
    "Hyundai/Tucson", "Hyundai/Santa Fe", "Hyundai/Kona", "Hyundai/Bayon",
    "Hyundai/IONIQ 5", "Hyundai/IONIQ 6",
    "Jeep/Compass", "Jeep/Renegade", "Jeep/Cherokee", "Jeep/Wrangler",
    "Jeep/Grand Cherokee", "Jeep/Avenger",
    "Kia/Picanto", "Kia/Rio", "Kia/Ceed", "Kia/Sportage", "Kia/Sorento",
    "Kia/Niro", "Kia/Stonic", "Kia/EV6",
    "Land Rover/Defender", "Land Rover/Discovery", "Land Rover/Discovery Sport",
    "Land Rover/Range Rover", "Land Rover/Range Rover Evoque",
    "Land Rover/Range Rover Velar", "Land Rover/Range Rover Sport",
    "Lexus/UX", "Lexus/NX", "Lexus/RX", "Lexus/IS", "Lexus/ES",
    "Mazda/Mazda2", "Mazda/Mazda3", "Mazda/Mazda6",
    "Mazda/CX-3", "Mazda/CX-5", "Mazda/CX-30", "Mazda/MX-5",
    "Mercedes-Benz/A Serisi", "Mercedes-Benz/C Serisi", "Mercedes-Benz/E Serisi",
    "Mercedes-Benz/S Serisi", "Mercedes-Benz/CLA", "Mercedes-Benz/GLA",
    "Mercedes-Benz/GLB", "Mercedes-Benz/GLC", "Mercedes-Benz/GLE",
    "Mercedes-Benz/GLS", "Mercedes-Benz/Vito",
    "MG/ZS", "MG/HS", "MG/Marvel R", "MG/MG4",
    "Mini/Cooper", "Mini/Countryman", "Mini/Clubman",
    "Mitsubishi/Eclipse Cross", "Mitsubishi/ASX", "Mitsubishi/L200",
    "Nissan/Qashqai", "Nissan/Juke", "Nissan/X-Trail",
    "Nissan/Micra", "Nissan/Leaf",
    "Opel/Astra", "Opel/Corsa", "Opel/Mokka", "Opel/Grandland",
    "Opel/Crossland", "Opel/Insignia", "Opel/Combo", "Opel/Vivaro",
    "Peugeot/208", "Peugeot/308", "Peugeot/508",
    "Peugeot/2008", "Peugeot/3008", "Peugeot/5008", "Peugeot/Rifter",
    "Porsche/Cayenne", "Porsche/Macan", "Porsche/Panamera", "Porsche/Taycan",
    "Renault/Clio", "Renault/Megane", "Renault/Kadjar", "Renault/Captur",
    "Renault/Symbol", "Renault/Talisman", "Renault/Koleos",
    "Renault/Austral", "Renault/Arkana", "Renault/Master",
    "Seat/Leon", "Seat/Ibiza", "Seat/Arona", "Seat/Ateca", "Seat/Tarraco",
    "Seres/3", "Seres/5",
    "Skoda/Octavia", "Skoda/Superb", "Skoda/Karoq", "Skoda/Kodiaq",
    "Skoda/Fabia", "Skoda/Scala", "Skoda/Kamiq", "Skoda/Enyaq",
    "Subaru/Outback", "Subaru/Forester",
    "Suzuki/Swift", "Suzuki/Vitara", "Suzuki/S-Cross",
    "Suzuki/Ignis", "Suzuki/Jimny",
    "Tesla/Model 3", "Tesla/Model Y", "Tesla/Model S", "Tesla/Model X",
    "Togg/T10X", "Togg/T10F",
    "Toyota/Corolla", "Toyota/Yaris", "Toyota/C-HR", "Toyota/RAV4",
    "Toyota/Camry", "Toyota/Hilux", "Toyota/Land Cruiser", "Toyota/Proace",
    "Volkswagen/Golf", "Volkswagen/Passat", "Volkswagen/Tiguan", "Volkswagen/Polo",
    "Volkswagen/Jetta", "Volkswagen/T-Roc", "Volkswagen/T-Cross", "Volkswagen/Taigo",
    "Volkswagen/ID.3", "Volkswagen/ID.4", "Volkswagen/ID.5",
    "Volkswagen/ID.Buzz", "Volkswagen/Amarok", "Volkswagen/Caddy",
    "Volkswagen/Transporter", "Volkswagen/Multivan",
    "Volvo/XC40", "Volvo/XC60", "Volvo/XC90",
    "Volvo/V40", "Volvo/V60", "Volvo/S60", "Volvo/S90",
  ];

  const vehiclePrices = vehicleKeys.map(() => 35000); // Varsayılan 35000 USD

  console.log(`\nGayrimenkul: ${realestateKeys.length} lokasyon eklenecek`);
  console.log(`Araç: ${vehicleKeys.length} model eklenecek`);

  // Batch işlemi (gas limit'i aşmamak için parçalara böl)
  const batchSize = 100;

  // Gayrimenkul fiyatları
  for (let i = 0; i < realestateKeys.length; i += batchSize) {
    const batchKeys = realestateKeys.slice(i, i + batchSize).map(normalizeKey);
    const batchPrices = realestatePrices.slice(i, i + batchSize);

    console.log(`\nGayrimenkul batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(realestateKeys.length / batchSize)}...`);

    const tx = await oracle.updatePriceTable("realestate", batchKeys, batchPrices);
    await tx.wait();
    console.log(`  ✓ ${batchKeys.length} lokasyon eklendi`);
  }

  // Araç fiyatları
  for (let i = 0; i < vehicleKeys.length; i += batchSize) {
    const batchKeys = vehicleKeys.slice(i, i + batchSize).map(normalizeKey);
    const batchPrices = vehiclePrices.slice(i, i + batchSize);

    console.log(`\nAraç batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vehicleKeys.length / batchSize)}...`);

    const tx = await oracle.updatePriceTable("vehicle", batchKeys, batchPrices);
    await tx.wait();
    console.log(`  ✓ ${batchKeys.length} model eklendi`);
  }

  console.log("\n✅ Tüm fiyat verileri başarıyla kuruldu!");
  console.log(`Toplam: ${realestateKeys.length} gayrimenkul lokasyonu + ${vehicleKeys.length} araç modeli`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
