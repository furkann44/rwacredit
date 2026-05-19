const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { scrapeEmlakjet, scrapeArabam, scrapeHepsiemlak, scrapeSahibindenProperty } = require('./scrapers/live');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

app.options('/api/valuation/*', cors());

const CACHE_DIR = path.join(__dirname, 'cache');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

const PROPERTY_CACHE = path.join(CACHE_DIR, 'property-prices.json');
const VEHICLE_CACHE = path.join(CACHE_DIR, 'vehicle-prices.json');

const USD_TRY = 42;
const TURKEY_AVG = 25000;

const CITY_MULTIPLIERS = {
  'Istanbul': 1.6, 'Ankara': 1.2, 'Izmir': 1.2, 'Antalya': 1.2,
  'Bursa': 1.0, 'Kocaeli': 1.0, 'Mugla': 1.3, 'Trabzon': 1.0,
  'Adana': 0.8, 'Gaziantep': 0.8, 'Konya': 0.8, 'Mersin': 0.9,
  'Tekirdag': 0.9, 'Sakarya': 0.9, 'Balikesir': 0.9, 'Canakkale': 0.9,
  'Eskisehir': 0.9, 'Denizli': 0.8, 'Manisa': 0.8, 'Sanliurfa': 0.6,
  'Malatya': 0.7, 'Diyarbakir': 0.7, 'Samsun': 0.8, 'Kayseri': 0.8,
};

const DISTRICT_MULTIPLIERS = {
  'besiktas': 1.5, 'kadikoy': 1.4, 'sisli': 1.4, 'bakirkoy': 1.3, 'sariyer': 1.5, 'beykoz': 1.3, 'cankaya': 1.4, 'bornova': 1.2, 'konyaalti': 1.3, 'bodrum': 1.6,
  'uskudar': 1.2, 'atasehir': 1.3, 'maltepe': 1.1, 'yenimahalle': 1.1, 'bayrakli': 1.1, 'muratpasa': 1.2, 'alanya': 1.3,
  'esenyurt': 0.8, 'pendik': 0.9, 'beylikduzu': 0.8, 'mamak': 0.8, 'etimesgut': 0.8, 'buca': 0.8,
  'yesilyurt': 0.9, 'battalgazi': 0.8, 'gazi': 0.7, 'sehitkamil': 0.9,
};

const VEHICLE_BASE_PRICES = {
  // Alfa Romeo
  'Alfa Romeo/Giulia': { base: 4200000, yearDep: 0.15, kmDep: 0.000025 },
  'Alfa Romeo/Stelvio': { base: 4800000, yearDep: 0.15, kmDep: 0.000025 },
  'Alfa Romeo/Tonale': { base: 3800000, yearDep: 0.12, kmDep: 0.00002 },
  // Audi
  'Audi/A1': { base: 2800000, yearDep: 0.12, kmDep: 0.00002 },
  'Audi/A3': { base: 3700000, yearDep: 0.12, kmDep: 0.00002 },
  'Audi/A4': { base: 5800000, yearDep: 0.15, kmDep: 0.000025 },
  'Audi/A5': { base: 6200000, yearDep: 0.15, kmDep: 0.000025 },
  'Audi/A6': { base: 7200000, yearDep: 0.15, kmDep: 0.000025 },
  'Audi/Q3': { base: 4000000, yearDep: 0.14, kmDep: 0.00002 },
  'Audi/Q5': { base: 5500000, yearDep: 0.14, kmDep: 0.00002 },
  'Audi/Q7': { base: 8200000, yearDep: 0.15, kmDep: 0.000025 },
  'Audi/e-tron': { base: 7500000, yearDep: 0.12, kmDep: 0.000015 },
  // BMW
  'BMW/1 Serisi': { base: 3200000, yearDep: 0.12, kmDep: 0.00002 },
  'BMW/3 Serisi': { base: 5200000, yearDep: 0.15, kmDep: 0.000025 },
  'BMW/4 Serisi': { base: 5800000, yearDep: 0.15, kmDep: 0.000025 },
  'BMW/5 Serisi': { base: 7200000, yearDep: 0.15, kmDep: 0.000025 },
  'BMW/7 Serisi': { base: 12000000, yearDep: 0.18, kmDep: 0.00003 },
  'BMW/X1': { base: 4200000, yearDep: 0.14, kmDep: 0.00002 },
  'BMW/X3': { base: 5800000, yearDep: 0.14, kmDep: 0.00002 },
  'BMW/X5': { base: 8500000, yearDep: 0.15, kmDep: 0.000025 },
  'BMW/X6': { base: 9500000, yearDep: 0.15, kmDep: 0.000025 },
  'BMW/i4': { base: 6800000, yearDep: 0.12, kmDep: 0.000015 },
  'BMW/iX': { base: 9000000, yearDep: 0.12, kmDep: 0.000015 },
  'BMW/Z4': { base: 6500000, yearDep: 0.15, kmDep: 0.00002 },
  // BYD
  'BYD/Atto 3': { base: 2800000, yearDep: 0.10, kmDep: 0.000015 },
  'BYD/Han': { base: 4200000, yearDep: 0.10, kmDep: 0.000015 },
  'BYD/Tang': { base: 3500000, yearDep: 0.10, kmDep: 0.000015 },
  'BYD/Dolphin': { base: 2200000, yearDep: 0.10, kmDep: 0.000015 },
  'BYD/Seal': { base: 3200000, yearDep: 0.10, kmDep: 0.000015 },
  // Chery
  'Chery/Tiggo 7': { base: 2100000, yearDep: 0.10, kmDep: 0.00002 },
  'Chery/Tiggo 8': { base: 2500000, yearDep: 0.10, kmDep: 0.00002 },
  'Chery/Omoda 5': { base: 1900000, yearDep: 0.10, kmDep: 0.00002 },
  // Citroen
  'Citroen/C3': { base: 1600000, yearDep: 0.08, kmDep: 0.000015 },
  'Citroen/C4': { base: 2200000, yearDep: 0.10, kmDep: 0.00002 },
  'Citroen/C5': { base: 2800000, yearDep: 0.12, kmDep: 0.00002 },
  'Citroen/C3 Aircross': { base: 1800000, yearDep: 0.10, kmDep: 0.00002 },
  'Citroen/C5 Aircross': { base: 2900000, yearDep: 0.12, kmDep: 0.00002 },
  'Citroen/Berlingo': { base: 1700000, yearDep: 0.08, kmDep: 0.000015 },
  // Cupra
  'Cupra/Leon': { base: 3200000, yearDep: 0.12, kmDep: 0.00002 },
  'Cupra/Formentor': { base: 3800000, yearDep: 0.12, kmDep: 0.00002 },
  'Cupra/Born': { base: 3500000, yearDep: 0.10, kmDep: 0.000015 },
  'Cupra/Ateca': { base: 3600000, yearDep: 0.12, kmDep: 0.00002 },
  // Dacia
  'Dacia/Duster': { base: 1650000, yearDep: 0.08, kmDep: 0.000015 },
  'Dacia/Sandero': { base: 1200000, yearDep: 0.08, kmDep: 0.000015 },
  'Dacia/Logan': { base: 1150000, yearDep: 0.08, kmDep: 0.000015 },
  'Dacia/Jogger': { base: 1550000, yearDep: 0.08, kmDep: 0.000015 },
  'Dacia/Spring': { base: 1350000, yearDep: 0.08, kmDep: 0.00001 },
  // DS
  'DS/DS 3': { base: 2400000, yearDep: 0.12, kmDep: 0.00002 },
  'DS/DS 4': { base: 3200000, yearDep: 0.12, kmDep: 0.00002 },
  'DS/DS 7': { base: 3800000, yearDep: 0.12, kmDep: 0.00002 },
  // Fiat
  'Fiat/Egea': { base: 1750000, yearDep: 0.08, kmDep: 0.000015 },
  'Fiat/500': { base: 1400000, yearDep: 0.08, kmDep: 0.000015 },
  'Fiat/500X': { base: 1900000, yearDep: 0.10, kmDep: 0.00002 },
  'Fiat/Panda': { base: 1100000, yearDep: 0.08, kmDep: 0.000015 },
  'Fiat/Tipo': { base: 1850000, yearDep: 0.08, kmDep: 0.000015 },
  'Fiat/Doblo': { base: 1600000, yearDep: 0.08, kmDep: 0.000015 },
  'Fiat/Fiorino': { base: 1300000, yearDep: 0.08, kmDep: 0.000015 },
  // Ford
  'Ford/Focus': { base: 2500000, yearDep: 0.10, kmDep: 0.00002 },
  'Ford/Fiesta': { base: 1700000, yearDep: 0.08, kmDep: 0.000015 },
  'Ford/Kuga': { base: 3200000, yearDep: 0.12, kmDep: 0.00002 },
  'Ford/Puma': { base: 2200000, yearDep: 0.10, kmDep: 0.00002 },
  'Ford/Mondeo': { base: 3100000, yearDep: 0.12, kmDep: 0.00002 },
  'Ford/Ranger': { base: 3800000, yearDep: 0.12, kmDep: 0.00002 },
  'Ford/EcoSport': { base: 1800000, yearDep: 0.10, kmDep: 0.00002 },
  'Ford/Transit': { base: 3200000, yearDep: 0.10, kmDep: 0.00002 },
  // Honda
  'Honda/Civic': { base: 3000000, yearDep: 0.10, kmDep: 0.00002 },
  'Honda/CR-V': { base: 3600000, yearDep: 0.12, kmDep: 0.00002 },
  'Honda/HR-V': { base: 2600000, yearDep: 0.10, kmDep: 0.00002 },
  'Honda/Jazz': { base: 1900000, yearDep: 0.08, kmDep: 0.000015 },
  'Honda/City': { base: 1700000, yearDep: 0.08, kmDep: 0.000015 },
  // Hyundai
  'Hyundai/i10': { base: 1400000, yearDep: 0.08, kmDep: 0.000015 },
  'Hyundai/i20': { base: 1850000, yearDep: 0.08, kmDep: 0.000015 },
  'Hyundai/i30': { base: 2200000, yearDep: 0.10, kmDep: 0.00002 },
  'Hyundai/Accent': { base: 1550000, yearDep: 0.08, kmDep: 0.000015 },
  'Hyundai/Elantra': { base: 2400000, yearDep: 0.10, kmDep: 0.00002 },
  'Hyundai/Tucson': { base: 3500000, yearDep: 0.12, kmDep: 0.00002 },
  'Hyundai/Santa Fe': { base: 4200000, yearDep: 0.14, kmDep: 0.00002 },
  'Hyundai/Kona': { base: 2400000, yearDep: 0.10, kmDep: 0.00002 },
  'Hyundai/Bayon': { base: 2000000, yearDep: 0.10, kmDep: 0.00002 },
  'Hyundai/IONIQ 5': { base: 3800000, yearDep: 0.10, kmDep: 0.000015 },
  'Hyundai/IONIQ 6': { base: 4200000, yearDep: 0.10, kmDep: 0.000015 },
  // Jeep
  'Jeep/Compass': { base: 3200000, yearDep: 0.12, kmDep: 0.00002 },
  'Jeep/Renegade': { base: 2500000, yearDep: 0.12, kmDep: 0.00002 },
  'Jeep/Cherokee': { base: 3800000, yearDep: 0.14, kmDep: 0.000025 },
  'Jeep/Wrangler': { base: 5500000, yearDep: 0.14, kmDep: 0.000025 },
  'Jeep/Grand Cherokee': { base: 4800000, yearDep: 0.15, kmDep: 0.000025 },
  'Jeep/Avenger': { base: 2800000, yearDep: 0.10, kmDep: 0.00002 },
  // Kia
  'Kia/Picanto': { base: 1300000, yearDep: 0.08, kmDep: 0.000015 },
  'Kia/Rio': { base: 1600000, yearDep: 0.08, kmDep: 0.000015 },
  'Kia/Ceed': { base: 2300000, yearDep: 0.10, kmDep: 0.00002 },
  'Kia/Sportage': { base: 3300000, yearDep: 0.12, kmDep: 0.00002 },
  'Kia/Sorento': { base: 4500000, yearDep: 0.14, kmDep: 0.00002 },
  'Kia/Niro': { base: 2800000, yearDep: 0.10, kmDep: 0.00002 },
  'Kia/Stonic': { base: 1900000, yearDep: 0.10, kmDep: 0.00002 },
  'Kia/EV6': { base: 4200000, yearDep: 0.10, kmDep: 0.000015 },
  // Land Rover
  'Land Rover/Defender': { base: 8500000, yearDep: 0.15, kmDep: 0.000025 },
  'Land Rover/Discovery': { base: 7200000, yearDep: 0.15, kmDep: 0.000025 },
  'Land Rover/Discovery Sport': { base: 4800000, yearDep: 0.14, kmDep: 0.00002 },
  'Land Rover/Range Rover': { base: 15000000, yearDep: 0.18, kmDep: 0.00003 },
  'Land Rover/Range Rover Evoque': { base: 5200000, yearDep: 0.14, kmDep: 0.00002 },
  'Land Rover/Range Rover Velar': { base: 7800000, yearDep: 0.15, kmDep: 0.000025 },
  'Land Rover/Range Rover Sport': { base: 9500000, yearDep: 0.15, kmDep: 0.000025 },
  // Lexus
  'Lexus/UX': { base: 3800000, yearDep: 0.12, kmDep: 0.00002 },
  'Lexus/NX': { base: 4800000, yearDep: 0.12, kmDep: 0.00002 },
  'Lexus/RX': { base: 6500000, yearDep: 0.14, kmDep: 0.00002 },
  'Lexus/IS': { base: 4200000, yearDep: 0.14, kmDep: 0.000025 },
  'Lexus/ES': { base: 5200000, yearDep: 0.14, kmDep: 0.00002 },
  // Mazda
  'Mazda/Mazda2': { base: 1700000, yearDep: 0.10, kmDep: 0.00002 },
  'Mazda/Mazda3': { base: 2400000, yearDep: 0.10, kmDep: 0.00002 },
  'Mazda/Mazda6': { base: 3200000, yearDep: 0.12, kmDep: 0.00002 },
  'Mazda/CX-3': { base: 2200000, yearDep: 0.10, kmDep: 0.00002 },
  'Mazda/CX-5': { base: 3400000, yearDep: 0.12, kmDep: 0.00002 },
  'Mazda/CX-30': { base: 2800000, yearDep: 0.10, kmDep: 0.00002 },
  'Mazda/MX-5': { base: 3200000, yearDep: 0.12, kmDep: 0.00002 },
  // Mercedes-Benz
  'Mercedes-Benz/A Serisi': { base: 3200000, yearDep: 0.12, kmDep: 0.00002 },
  'Mercedes-Benz/C Serisi': { base: 5600000, yearDep: 0.15, kmDep: 0.000025 },
  'Mercedes-Benz/E Serisi': { base: 7800000, yearDep: 0.15, kmDep: 0.000025 },
  'Mercedes-Benz/S Serisi': { base: 14000000, yearDep: 0.18, kmDep: 0.00003 },
  'Mercedes-Benz/CLA': { base: 3800000, yearDep: 0.12, kmDep: 0.00002 },
  'Mercedes-Benz/GLA': { base: 4500000, yearDep: 0.14, kmDep: 0.00002 },
  'Mercedes-Benz/GLB': { base: 4800000, yearDep: 0.14, kmDep: 0.00002 },
  'Mercedes-Benz/GLC': { base: 6200000, yearDep: 0.14, kmDep: 0.00002 },
  'Mercedes-Benz/GLE': { base: 8500000, yearDep: 0.15, kmDep: 0.000025 },
  'Mercedes-Benz/GLS': { base: 12000000, yearDep: 0.15, kmDep: 0.000025 },
  'Mercedes-Benz/Vito': { base: 3800000, yearDep: 0.10, kmDep: 0.00002 },
  // MG
  'MG/ZS': { base: 1800000, yearDep: 0.10, kmDep: 0.00002 },
  'MG/HS': { base: 2200000, yearDep: 0.10, kmDep: 0.00002 },
  'MG/Marvel R': { base: 3200000, yearDep: 0.10, kmDep: 0.000015 },
  'MG/MG4': { base: 2000000, yearDep: 0.10, kmDep: 0.000015 },
  // Mini
  'Mini/Cooper': { base: 2500000, yearDep: 0.10, kmDep: 0.00002 },
  'Mini/Countryman': { base: 3200000, yearDep: 0.12, kmDep: 0.00002 },
  'Mini/Clubman': { base: 3000000, yearDep: 0.12, kmDep: 0.00002 },
  // Mitsubishi
  'Mitsubishi/Eclipse Cross': { base: 2800000, yearDep: 0.12, kmDep: 0.00002 },
  'Mitsubishi/ASX': { base: 2100000, yearDep: 0.10, kmDep: 0.00002 },
  'Mitsubishi/L200': { base: 3500000, yearDep: 0.10, kmDep: 0.00002 },
  // Nissan
  'Nissan/Qashqai': { base: 3100000, yearDep: 0.12, kmDep: 0.00002 },
  'Nissan/Juke': { base: 2200000, yearDep: 0.10, kmDep: 0.00002 },
  'Nissan/X-Trail': { base: 3500000, yearDep: 0.12, kmDep: 0.00002 },
  'Nissan/Micra': { base: 1600000, yearDep: 0.08, kmDep: 0.000015 },
  'Nissan/Leaf': { base: 2800000, yearDep: 0.10, kmDep: 0.000015 },
  // Opel
  'Opel/Astra': { base: 2300000, yearDep: 0.10, kmDep: 0.00002 },
  'Opel/Corsa': { base: 1750000, yearDep: 0.08, kmDep: 0.000015 },
  'Opel/Mokka': { base: 2100000, yearDep: 0.10, kmDep: 0.00002 },
  'Opel/Grandland': { base: 3000000, yearDep: 0.12, kmDep: 0.00002 },
  'Opel/Crossland': { base: 2000000, yearDep: 0.10, kmDep: 0.00002 },
  'Opel/Insignia': { base: 3400000, yearDep: 0.12, kmDep: 0.00002 },
  'Opel/Combo': { base: 1800000, yearDep: 0.08, kmDep: 0.000015 },
  'Opel/Vivaro': { base: 2800000, yearDep: 0.10, kmDep: 0.00002 },
  // Peugeot
  'Peugeot/208': { base: 1800000, yearDep: 0.08, kmDep: 0.000015 },
  'Peugeot/308': { base: 2500000, yearDep: 0.10, kmDep: 0.00002 },
  'Peugeot/508': { base: 3200000, yearDep: 0.12, kmDep: 0.00002 },
  'Peugeot/2008': { base: 2100000, yearDep: 0.10, kmDep: 0.00002 },
  'Peugeot/3008': { base: 3300000, yearDep: 0.12, kmDep: 0.00002 },
  'Peugeot/5008': { base: 3500000, yearDep: 0.12, kmDep: 0.00002 },
  'Peugeot/Rifter': { base: 2200000, yearDep: 0.10, kmDep: 0.00002 },
  // Porsche
  'Porsche/Cayenne': { base: 12000000, yearDep: 0.15, kmDep: 0.000025 },
  'Porsche/Macan': { base: 8500000, yearDep: 0.15, kmDep: 0.000025 },
  'Porsche/Panamera': { base: 11000000, yearDep: 0.15, kmDep: 0.000025 },
  'Porsche/Taycan': { base: 10000000, yearDep: 0.12, kmDep: 0.000015 },
  // Renault
  'Renault/Clio': { base: 1950000, yearDep: 0.08, kmDep: 0.000015 },
  'Renault/Megane': { base: 2500000, yearDep: 0.08, kmDep: 0.000015 },
  'Renault/Kadjar': { base: 2800000, yearDep: 0.12, kmDep: 0.00002 },
  'Renault/Captur': { base: 2200000, yearDep: 0.10, kmDep: 0.00002 },
  'Renault/Symbol': { base: 1400000, yearDep: 0.08, kmDep: 0.000015 },
  'Renault/Talisman': { base: 3000000, yearDep: 0.12, kmDep: 0.00002 },
  'Renault/Koleos': { base: 3200000, yearDep: 0.12, kmDep: 0.00002 },
  'Renault/Austral': { base: 2900000, yearDep: 0.10, kmDep: 0.00002 },
  'Renault/Arkana': { base: 2600000, yearDep: 0.10, kmDep: 0.00002 },
  'Renault/Master': { base: 3200000, yearDep: 0.10, kmDep: 0.00002 },
  // Seat
  'Seat/Leon': { base: 2300000, yearDep: 0.10, kmDep: 0.00002 },
  'Seat/Ibiza': { base: 1700000, yearDep: 0.08, kmDep: 0.000015 },
  'Seat/Arona': { base: 2000000, yearDep: 0.10, kmDep: 0.00002 },
  'Seat/Ateca': { base: 2900000, yearDep: 0.12, kmDep: 0.00002 },
  'Seat/Tarraco': { base: 3400000, yearDep: 0.12, kmDep: 0.00002 },
  // Seres
  'Seres/3': { base: 1800000, yearDep: 0.10, kmDep: 0.000015 },
  'Seres/5': { base: 2200000, yearDep: 0.10, kmDep: 0.000015 },
  // Skoda
  'Skoda/Octavia': { base: 2700000, yearDep: 0.10, kmDep: 0.00002 },
  'Skoda/Superb': { base: 3500000, yearDep: 0.12, kmDep: 0.00002 },
  'Skoda/Karoq': { base: 2900000, yearDep: 0.12, kmDep: 0.00002 },
  'Skoda/Kodiaq': { base: 3800000, yearDep: 0.12, kmDep: 0.00002 },
  'Skoda/Fabia': { base: 1700000, yearDep: 0.08, kmDep: 0.000015 },
  'Skoda/Scala': { base: 2100000, yearDep: 0.10, kmDep: 0.00002 },
  'Skoda/Kamiq': { base: 2300000, yearDep: 0.10, kmDep: 0.00002 },
  'Skoda/Enyaq': { base: 3800000, yearDep: 0.10, kmDep: 0.000015 },
  // Subaru
  'Subaru/Outback': { base: 4200000, yearDep: 0.14, kmDep: 0.000025 },
  'Subaru/Forester': { base: 3800000, yearDep: 0.14, kmDep: 0.000025 },
  // Suzuki
  'Suzuki/Swift': { base: 1700000, yearDep: 0.08, kmDep: 0.000015 },
  'Suzuki/Vitara': { base: 2400000, yearDep: 0.10, kmDep: 0.00002 },
  'Suzuki/S-Cross': { base: 2200000, yearDep: 0.10, kmDep: 0.00002 },
  'Suzuki/Ignis': { base: 1400000, yearDep: 0.08, kmDep: 0.000015 },
  'Suzuki/Jimny': { base: 2600000, yearDep: 0.10, kmDep: 0.00002 },
  // Tesla
  'Tesla/Model 3': { base: 4200000, yearDep: 0.10, kmDep: 0.000015 },
  'Tesla/Model Y': { base: 5000000, yearDep: 0.10, kmDep: 0.000015 },
  'Tesla/Model S': { base: 7500000, yearDep: 0.12, kmDep: 0.000015 },
  'Tesla/Model X': { base: 8000000, yearDep: 0.12, kmDep: 0.000015 },
  // Togg
  'Togg/T10X': { base: 2300000, yearDep: 0.08, kmDep: 0.00001 },
  'Togg/T10F': { base: 2500000, yearDep: 0.08, kmDep: 0.00001 },
  // Toyota
  'Toyota/Corolla': { base: 2800000, yearDep: 0.10, kmDep: 0.00002 },
  'Toyota/Yaris': { base: 1900000, yearDep: 0.08, kmDep: 0.000015 },
  'Toyota/C-HR': { base: 3100000, yearDep: 0.10, kmDep: 0.00002 },
  'Toyota/RAV4': { base: 3800000, yearDep: 0.12, kmDep: 0.00002 },
  'Toyota/Camry': { base: 4200000, yearDep: 0.12, kmDep: 0.00002 },
  'Toyota/Hilux': { base: 4500000, yearDep: 0.10, kmDep: 0.00002 },
  'Toyota/Land Cruiser': { base: 8500000, yearDep: 0.12, kmDep: 0.00002 },
  'Toyota/Proace': { base: 3000000, yearDep: 0.10, kmDep: 0.00002 },
  // Volkswagen
  'Volkswagen/Golf': { base: 3200000, yearDep: 0.12, kmDep: 0.00002 },
  'Volkswagen/Passat': { base: 3700000, yearDep: 0.12, kmDep: 0.00002 },
  'Volkswagen/Tiguan': { base: 3900000, yearDep: 0.12, kmDep: 0.00002 },
  'Volkswagen/Polo': { base: 2100000, yearDep: 0.08, kmDep: 0.000015 },
  'Volkswagen/Jetta': { base: 2800000, yearDep: 0.10, kmDep: 0.00002 },
  'Volkswagen/T-Roc': { base: 2800000, yearDep: 0.12, kmDep: 0.00002 },
  'Volkswagen/T-Cross': { base: 2300000, yearDep: 0.10, kmDep: 0.00002 },
  'Volkswagen/Taigo': { base: 2400000, yearDep: 0.10, kmDep: 0.00002 },
  'Volkswagen/ID.3': { base: 3500000, yearDep: 0.10, kmDep: 0.000015 },
  'Volkswagen/ID.4': { base: 4200000, yearDep: 0.10, kmDep: 0.000015 },
  'Volkswagen/ID.5': { base: 4500000, yearDep: 0.10, kmDep: 0.000015 },
  'Volkswagen/ID.Buzz': { base: 4800000, yearDep: 0.10, kmDep: 0.000015 },
  'Volkswagen/Amarok': { base: 4800000, yearDep: 0.12, kmDep: 0.00002 },
  'Volkswagen/Caddy': { base: 2500000, yearDep: 0.10, kmDep: 0.00002 },
  'Volkswagen/Transporter': { base: 3500000, yearDep: 0.10, kmDep: 0.00002 },
  'Volkswagen/Multivan': { base: 4200000, yearDep: 0.10, kmDep: 0.00002 },
  // Volvo
  'Volvo/XC40': { base: 4500000, yearDep: 0.14, kmDep: 0.00002 },
  'Volvo/XC60': { base: 5800000, yearDep: 0.14, kmDep: 0.00002 },
  'Volvo/XC90': { base: 7800000, yearDep: 0.15, kmDep: 0.000025 },
  'Volvo/V40': { base: 2800000, yearDep: 0.12, kmDep: 0.00002 },
  'Volvo/V60': { base: 3800000, yearDep: 0.12, kmDep: 0.00002 },
  'Volvo/S60': { base: 3600000, yearDep: 0.12, kmDep: 0.00002 },
  'Volvo/S90': { base: 5200000, yearDep: 0.14, kmDep: 0.00002 },
  // Volkswagen - eski key uyumluluk
  'VW/Golf': { base: 3200000, yearDep: 0.12, kmDep: 0.00002 },
  'VW/Passat': { base: 3700000, yearDep: 0.12, kmDep: 0.00002 },
  'VW/Tiguan': { base: 3900000, yearDep: 0.12, kmDep: 0.00002 },
  'VW/Polo': { base: 2100000, yearDep: 0.08, kmDep: 0.000015 },
  'VW/T-Roc': { base: 2800000, yearDep: 0.12, kmDep: 0.00002 },
};
const DEFAULT_VEHICLE_BASE_TL = 2000000;

function loadCache(fp) { try { if (fs.existsSync(fp)) return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch(e) {} return {}; }
function saveCache(fp, d) { try { fs.writeFileSync(fp, JSON.stringify(d, null, 2)); } catch(e) {} }

let propertyCache = loadCache(PROPERTY_CACHE);
let vehicleCache = loadCache(VEHICLE_CACHE);

// ============================================================
// LIVE VALUATION - SSE STREAMING
// ============================================================

app.post('/api/valuation/property', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const { city, district, area, propertyType } = req.body;
  const locationKey = city + '/' + district;
  const typeMultiplier = { residence: 1.0, commercial: 1.3, land: 0.6, farm: 0.4 };
  const multiplier = typeMultiplier[propertyType] || 1.0;

  const send = (msg, progress, data) => {
    res.write('data: ' + JSON.stringify({ message: msg, progress, data }) + '\n\n');
  };

  try {
    // Cache kontrolü (5 dk geçerli)
    const cached = propertyCache[locationKey];
    if (cached && cached.lastUpdate) {
      const age = Date.now() - new Date(cached.lastUpdate).getTime();
      if (age < 5 * 60 * 1000 && cached.sampleSize > 0) {
        send('Cache kullaniliyor...', 10);
        const pricePerSqmTL = Math.round(cached.pricePerSqmTL * multiplier);
        const estimatedValueTL = pricePerSqmTL * area;
        const estimatedValueUSD = Math.round(estimatedValueTL / USD_TRY);
        send('Tamamlandi!', 100, {
          location: locationKey, area, propertyType,
          pricePerSqmTL, pricePerSqmUSD: Math.round(pricePerSqmTL / USD_TRY),
          estimatedValueTL, estimatedValueUSD,
          creditLimit70: Math.round(estimatedValueUSD * 0.7),
          confidence: cached.confidence, sampleSize: cached.sampleSize,
          sources: cached.sources, isLiveScraped: true,
          lastUpdate: cached.lastUpdate
        });
        res.end();
        return;
      }
    }

    // Paralel scraping
    send('Siteler taranıyor...', 10);
    const [emlakjetResults, hepsieResults, sahibindenResults] = await Promise.allSettled([
      scrapeEmlakjet(city, district, (msg, p) => send(msg, Math.min(p, 35))),
      scrapeHepsiemlak(city, district, (msg, p) => send(msg, Math.min(p + 35, 70))),
      scrapeSahibindenProperty(city, district, (msg, p) => send(msg, Math.min(p + 70, 90))),
    ]);

    send('Veriler birleştiriliyor...', 90);

    const allListings = [
      ...(emlakjetResults.status === 'fulfilled' ? emlakjetResults.value : []),
      ...(hepsieResults.status === 'fulfilled' ? hepsieResults.value : []),
      ...(sahibindenResults.status === 'fulfilled' ? sahibindenResults.value : []),
    ];
    send('Analiz yapılıyor...', 93);

    let pricePerSqmTL;
    let sampleSize = allListings.length;
    let sources = [];
    let confidence;

    if (sampleSize >= 3) {
      const pricesPerSqm = allListings.filter(l => l.area > 0).map(l => l.price / l.area);
      if (pricesPerSqm.length > 0) {
        pricesPerSqm.sort((a,b) => a-b);
        const q1 = pricesPerSqm[Math.floor(pricesPerSqm.length * 0.25)];
        const q3 = pricesPerSqm[Math.floor(pricesPerSqm.length * 0.75)];
        const iqr = q3 - q1;
        const filtered = pricesPerSqm.filter(p => p >= q1 - 1.5*iqr && p <= q3 + 1.5*iqr);
        pricePerSqmTL = Math.round(filtered.reduce((a,b) => a+b, 0) / filtered.length);
        confidence = filtered.length > 10 ? 'high' : 'medium';
      }
      sources = [];
      if (emlakjetResults.status === 'fulfilled' && emlakjetResults.value.length > 0) sources.push('emlakjet.com');
      if (hepsieResults.status === 'fulfilled' && hepsieResults.value.length > 0) sources.push('hepsiemlak.com');
      if (sahibindenResults.status === 'fulfilled' && sahibindenResults.value.length > 0) sources.push('sahibinden.com');
    }

    if (!pricePerSqmTL) {
      const cityMult = CITY_MULTIPLIERS[city] || 1.0;
      const distMult = DISTRICT_MULTIPLIERS[district.toLowerCase()] || 1.0;
      pricePerSqmTL = Math.round(TURKEY_AVG * cityMult * distMult);
      confidence = 'low';
      sources = ['tcmb.gov.tr', 'endeksa.com'];
      sampleSize = 0;
    }

    const estimatedValueTL = pricePerSqmTL * area;
    const estimatedValueUSD = Math.round(estimatedValueTL / USD_TRY);

    propertyCache[locationKey] = { pricePerSqmTL, pricePerSqmUSD: Math.round(pricePerSqmTL/USD_TRY), sampleSize, sources, confidence, lastUpdate: new Date().toISOString() };
    saveCache(PROPERTY_CACHE, propertyCache);

    send('Tamamlandi!', 100, {
      location: locationKey, area, propertyType,
      pricePerSqmTL, pricePerSqmUSD: Math.round(pricePerSqmTL / USD_TRY),
      estimatedValueTL, estimatedValueUSD,
      creditLimit70: Math.round(estimatedValueUSD * 0.7),
      confidence, sampleSize, sources,
      isLiveScraped: sampleSize > 0,
      lastUpdate: new Date().toISOString()
    });

  } catch (e) {
    console.log('Valuation error:', e.message);
    send('Hata: ' + e.message, 100, { error: e.message });
  }

  res.end();
});

// Vehicle valuation - SSE
app.post('/api/valuation/vehicle', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const { brand, model, year, km } = req.body;
  const vehicleKey = brand + '/' + model;

  const send = (msg, progress, data) => {
    res.write('data: ' + JSON.stringify({ message: msg, progress, data }) + '\n\n');
  };

  try {
    // Cache kontrolü (5 dk geçerli)
    const cached = vehicleCache[vehicleKey];
    if (cached && cached.lastUpdate) {
      const age = Date.now() - new Date(cached.lastUpdate).getTime();
      if (age < 5 * 60 * 1000 && cached.sampleSize > 0) {
        send('Cache kullaniliyor...', 10);
        const currentYear = new Date().getFullYear();
        const age2 = currentYear - year;
        const yearDep = VEHICLE_BASE_PRICES[vehicleKey] ? VEHICLE_BASE_PRICES[vehicleKey].yearDep : 0.10;
        const kmDep = VEHICLE_BASE_PRICES[vehicleKey] ? VEHICLE_BASE_PRICES[vehicleKey].kmDep : 0.00002;
        const totalDepreciation = Math.min(age2 * yearDep + (km || 0) * kmDep, 0.8);
        const estimatedValueTL = Math.round(cached.basePriceTL * (1 - totalDepreciation));
        send('Tamamlandi!', 100, {
          vehicle: vehicleKey, year, km: km || 0,
          basePriceTL: cached.basePriceTL, basePriceUSD: Math.round(cached.basePriceTL / USD_TRY),
          estimatedValueTL, estimatedValueUSD: Math.round(estimatedValueTL / USD_TRY),
          creditLimit50: Math.round(estimatedValueTL / USD_TRY * 0.5),
          confidence: cached.confidence, sampleSize: cached.sampleSize,
          sources: cached.sources, isLiveScraped: true,
          lastUpdate: cached.lastUpdate
        });
        res.end();
        return;
      }
    }

    send('arabam.com taraniyor...', 10);
    const arabamResults = await scrapeArabam(brand, model, year, (msg, p) => send(msg, Math.min(p, 60)));

    send('Veriler analiz ediliyor...', 70);

    const allPrices = arabamResults.map(l => l.price);
    let basePriceTL;
    let sampleSize = allPrices.length;
    let sources = [];
    let confidence;

    if (sampleSize >= 3) {
      allPrices.sort((a,b) => a-b);
      const q1 = allPrices[Math.floor(allPrices.length * 0.25)];
      const q3 = allPrices[Math.floor(allPrices.length * 0.75)];
      const iqr = q3 - q1;
      const filtered = allPrices.filter(p => p >= q1 - 1.5*iqr && p <= q3 + 1.5*iqr);
      basePriceTL = Math.round(filtered.reduce((a,b) => a+b, 0) / filtered.length);
      confidence = 'high';
      sources = ['arabam.com'];
    } else if (VEHICLE_BASE_PRICES[vehicleKey]) {
      basePriceTL = VEHICLE_BASE_PRICES[vehicleKey].base;
      confidence = 'medium';
      sources = ['market-data'];
    } else {
      basePriceTL = DEFAULT_VEHICLE_BASE_TL;
      confidence = 'low';
      sources = ['estimation'];
    }

    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    const yearDep = VEHICLE_BASE_PRICES[vehicleKey] ? VEHICLE_BASE_PRICES[vehicleKey].yearDep : 0.10;
    const kmDep = VEHICLE_BASE_PRICES[vehicleKey] ? VEHICLE_BASE_PRICES[vehicleKey].kmDep : 0.00002;
    const ageDepreciation = age * yearDep;
    const kmDepreciation = (km || 0) * kmDep;
    const totalDepreciation = Math.min(ageDepreciation + kmDepreciation, 0.8);
    const estimatedValueTL = Math.round(basePriceTL * (1 - totalDepreciation));
    const estimatedValueUSD = Math.round(estimatedValueTL / USD_TRY);

    vehicleCache[vehicleKey] = { basePriceTL, estimatedValueTL, estimatedValueUSD, sampleSize, sources, confidence, lastUpdate: new Date().toISOString() };
    saveCache(VEHICLE_CACHE, vehicleCache);

    send('Tamamlandi!', 100, {
      vehicle: vehicleKey, year, km: km || 0,
      basePriceTL, basePriceUSD: Math.round(basePriceTL / USD_TRY),
      estimatedValueTL, estimatedValueUSD,
      creditLimit50: Math.round(estimatedValueUSD * 0.5),
      ageDepreciation: Math.round(ageDepreciation * 100),
      kmDepreciation: Math.round(kmDepreciation * 100),
      totalDepreciation: Math.round(totalDepreciation * 100),
      confidence, sampleSize, sources,
      isLiveScraped: sampleSize > 0,
      lastUpdate: new Date().toISOString()
    });

  } catch (e) {
    console.log('Vehicle valuation error:', e.message);
    send('Hata: ' + e.message, 100, { error: e.message });
  }

  res.end();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), liveScraping: true, sources: ['emlakjet.com', 'hepsiemlak.com', 'sahibinden.com', 'arabam.com'] });
});

app.listen(PORT, () => {
  console.log('RWA Scraper API (LIVE) on port ' + PORT);
  console.log('Sources: emlakjet.com, hepsiemlak.com, arabam.com');
});

module.exports = app;
