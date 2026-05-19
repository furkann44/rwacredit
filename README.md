# RWA Credit - Gerçek Dünya Varlıkları Teminatlı Kredi Platformu

Türkiye'ye özgü gayrimenkul ve araç varlıklarının tokenize edilerek teminat gösterilmesi ve kredi çekilmesi için geliştirilmiş bir blockchain DApp projesi.

## 🏗️ Mimari

### Akıllı Kontratlar
- **RWARegistry**: Gayrimenkul ve araç varlık kayıt sistemi
- **RWAToken**: ERC-721 NFT tokenizasyon
- **ValuationOracle**: Hibrit değerleme sistemi (Scraping API + Manuel)
- **CreditPool**: Havuz bazlı kredi sistemi
- **P2PLending**: P2P borçlanma platformu
- **Liquidation**: Tasfiye ve açık artırma sistemi

### Teknoloji Stack
- **Blockchain**: Ethereum Sepolia Testnet
- **Smart Contracts**: Solidity 0.8.20, Hardhat
- **Frontend**: Next.js 14, React, TypeScript
- **Web3**: ethers.js v6, wagmi, viem
- **UI**: TailwindCSS + shadcn/ui

## 📦 Kurulum

### Gereksinimler
- Node.js >= 18
- npm veya yarn
- MetaMask cüzdanı

### Akıllı Kontratlar

`ash
# Bağımlılıkları yükle
npm install

# Derle
npm run compile

# Testleri çalıştır
npm run test

# Local node başlat
npm run node

# Sepolia'ya deploy et
npm run deploy
`

### Frontend

`ash
cd frontend
npm install
npm run dev
`

## 🔧 Kontrat Adresleri (Sepolia Testnet)

Deploy sonrası adresler buraya kaydedilecek:

| Kontrat | Adres |
|---------|-------|
| RWARegistry | - |
| RWAToken | - |
| ValuationOracle | - |
| CreditPool | - |
| P2PLending | - |
| Liquidation | - |

## 🌐 Kullanım

### 1. Varlık Kaydetme
- Gayrimenkul: Tapu bilgileri (il, ilçe, ada, parsel)
- Araç: Plaka, şasi no, marka, model, yıl, km

### 2. Değerleme
- Otomatik: Web scraping API ile piyasa araştırması
- Manuel: Yetkili değerleyici onayı
- Hibrid: Her ikisinin ortalaması

### 3. Kredi Çekme
- **Havuz Kredisi**: Likidite havuzundan otomatik
- **P2P Kredi**: Bireysel borç veren eşleşmesi

### 4. Geri Ödeme
- Aylık/taksitli ödeme
- Erken ödeme seçeneği
- Temerrüt durumunda tasfiye

## 📊 LTV Oranları

| Varlık Tipi | LTV Oranı |
|-------------|-----------|
| Gayrimenkul | %70 |
| Araç | %50 |

## 🔐 Güvenlik

- Reentrancy koruması
- Access control (Ownable)
- Pausable kontratlar
- Kilitli token transfer koruması

## 📁 Proje Yapısı

`
rwa-credit/
├── contracts/          # Solidity akıllı kontratlar
│   ├── RWARegistry.sol
│   ├── RWAToken.sol
│   ├── ValuationOracle.sol
│   ├── CreditPool.sol
│   ├── P2PLending.sol
│   └── Liquidation.sol
├── scripts/            # Deploy scriptleri
│   └── deploy.js
├── test/               # Test dosyaları
│   └── RWA.test.js
├── frontend/           # Next.js uygulaması
├── scraper/            # Web scraping API
├── hardhat.config.js
└── package.json
`

