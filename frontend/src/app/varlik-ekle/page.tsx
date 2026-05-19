'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { CONTRACTS } from '@/lib/constants';

function SearchableSelect({
  options, value, onChange, placeholder, required, disabled, loading, label, icon,
}: {
  options: { id: number | string; name: string }[];
  value: string; onChange: (val: string) => void; placeholder: string;
  required?: boolean; disabled?: boolean; loading?: boolean; label: string; icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);

  const filtered = search.trim()
    ? options.filter(o => o.name.toLowerCase().includes(search.toLowerCase()))
    : options;

  const selectedName = options.find(o => o.name === value)?.name || '';

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div
        className={`w-full px-3 py-2.5 border rounded-xl text-gray-900 cursor-pointer flex items-center justify-between transition-all duration-200 ${
          disabled ? 'bg-gray-50 border-gray-200 cursor-not-allowed text-gray-400' : 'bg-white border-gray-200 hover:border-blue-400'
        } ${open ? 'border-blue-500 ring-2 ring-blue-500/20' : ''}`}
        onClick={() => { if (!disabled) setOpen(!open); }}
      >
        <div className="flex items-center space-x-2">
          {icon && <span className="text-gray-400">{icon}</span>}
          <span className={selectedName ? 'text-gray-900' : 'text-gray-400'}>{selectedName || placeholder}</span>
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {open && !disabled && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-fade-in">
          <div className="p-2 border-b border-gray-100">
            <input
              ref={inputRef} type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ara..." className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {loading ? (
              <p className="p-3 text-sm text-gray-400 text-center">Yükleniyor...</p>
            ) : filtered.length === 0 ? (
              <p className="p-3 text-sm text-gray-400 text-center">Sonuç bulunamadı</p>
            ) : (
              filtered.map(opt => (
                <div key={opt.id}
                  className={`px-3 py-2.5 text-sm cursor-pointer rounded-lg transition-colors ${
                    opt.name === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={(e) => { e.stopPropagation(); onChange(opt.name); setOpen(false); setSearch(''); }}
                >
                  {opt.name}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {loading && <p className="text-xs text-gray-400 mt-1">Yükleniyor...</p>}
    </div>
  );
}

function StepIcon({ active, completed, label }: { active: boolean; completed: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
        completed ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md' :
        active ? 'bg-white border-2 border-blue-600 text-blue-600 shadow-sm animate-pulse-glow' :
        'bg-gray-100 border border-gray-200 text-gray-400'
      }`}>
        {completed ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <span>{label}</span>
        )}
      </div>
      <p className={`text-xs mt-1.5 font-medium ${completed ? 'text-blue-600' : active ? 'text-blue-600' : 'text-gray-400'}`}>
        {label}
      </p>
    </div>
  );
}

const RWA_REGISTRY_ABI = [
  { name: 'registerRealEstate', type: 'function', stateMutability: 'nonpayable', inputs: [
    { name: 'city', type: 'uint8' }, { name: 'district', type: 'string' },
    { name: 'neighborhood', type: 'string' }, { name: 'plotNumber', type: 'uint256' },
    { name: 'parcelNumber', type: 'uint256' }, { name: 'area', type: 'uint256' },
    { name: 'propertyType', type: 'uint8' }, { name: 'titleDeedType', type: 'uint8' },
    { name: 'locationData', type: 'string' },
  ], outputs: [{ type: 'uint256' }] },
  { name: 'registerVehicle', type: 'function', stateMutability: 'nonpayable', inputs: [
    { name: 'plate', type: 'string' }, { name: 'chassisNumber', type: 'string' },
    { name: 'brand', type: 'string' }, { name: 'model', type: 'string' },
    { name: 'year', type: 'uint256' }, { name: 'mileage', type: 'uint256' },
    { name: 'fuelType', type: 'string' },
  ], outputs: [{ type: 'uint256' }] },
  { name: 'getUserAssets', type: 'function', stateMutability: 'view', inputs: [
    { name: 'user', type: 'address' }
  ], outputs: [{ type: 'uint256[]' }] },
  { name: 'getAsset', type: 'function', stateMutability: 'view', inputs: [
    { name: 'assetId', type: 'uint256' }
  ], outputs: [
    { name: 'id', type: 'uint256' }, { name: 'assetType', type: 'uint8' },
    { name: 'status', type: 'uint8' }, { name: 'owner', type: 'address' },
    { name: 'createdAt', type: 'uint256' }, { name: 'valuationId', type: 'uint256' },
    { name: 'creditId', type: 'uint256' }
  ] },
  { name: 'getAssetCounter', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'linkValuation', type: 'function', stateMutability: 'nonpayable', inputs: [
    { name: 'assetId', type: 'uint256' }, { name: 'valuationId', type: 'uint256' }
  ], outputs: [] },
];

const VALUATION_ORACLE_ABI = [
  { name: 'estimateValue', type: 'function', stateMutability: 'nonpayable', inputs: [
    { name: 'assetId', type: 'uint256' }, { name: 'isRealEstate', type: 'bool' },
    { name: 'locationKey', type: 'string' }, { name: 'areaOrYear', type: 'uint256' },
    { name: 'additionalParam', type: 'uint256' },
  ], outputs: [{ type: 'uint256' }] },
  { name: 'submitManualValuation', type: 'function', stateMutability: 'nonpayable', inputs: [
    { name: 'assetId', type: 'uint256' }, { name: 'manualValue', type: 'uint256' },
    { name: 'dataSource', type: 'string' },
  ], outputs: [{ type: 'uint256' }] },
  { name: 'getAssetValuation', type: 'function', stateMutability: 'view', inputs: [
    { name: 'assetId', type: 'uint256' }
  ], outputs: [{ type: 'uint256' }, { type: 'bool' }] },
  { name: 'calculateCreditLimit', type: 'function', stateMutability: 'view', inputs: [
    { name: 'assetId', type: 'uint256' }, { name: 'isRealEstate', type: 'bool' }
  ], outputs: [{ type: 'uint256' }] },
  { name: 'assetValuations', type: 'function', stateMutability: 'view', inputs: [
    { name: 'assetId', type: 'uint256' }
  ], outputs: [{ type: 'uint256' }] },
];

const RWA_TOKEN_ABI = [
  { name: 'mint', type: 'function', stateMutability: 'nonpayable', inputs: [
    { name: 'to', type: 'address' }, { name: 'tokenId', type: 'uint256' }, { name: 'metadataUri', type: 'string' }
  ], outputs: [{ type: 'uint256' }] },
  { name: 'lockToken', type: 'function', stateMutability: 'nonpayable', inputs: [
    { name: 'tokenId', type: 'uint256' }
  ], outputs: [] },
  { name: 'isLocked', type: 'function', stateMutability: 'view', inputs: [
    { name: 'tokenId', type: 'uint256' }
  ], outputs: [{ type: 'bool' }] },
  { name: 'ownerOf', type: 'function', stateMutability: 'view', inputs: [
    { name: 'tokenId', type: 'uint256' }
  ], outputs: [{ type: 'address' }] },
];

const CREDIT_POOL_ABI = [
  { name: 'drawCredit', type: 'function', stateMutability: 'nonpayable', inputs: [
    { name: 'assetId', type: 'uint256' }, { name: 'amount', type: 'uint256' }
  ], outputs: [{ type: 'uint256' }] },
  { name: 'depositLiquidity', type: 'function', stateMutability: 'payable', inputs: [], outputs: [] },
  { name: 'withdrawLiquidity', type: 'function', stateMutability: 'nonpayable', inputs: [
    { name: 'amount', type: 'uint256' }
  ], outputs: [] },
  { name: 'getUserCredits', type: 'function', stateMutability: 'view', inputs: [
    { name: 'user', type: 'address' }
  ], outputs: [{ type: 'uint256[]' }] },
  { name: 'getCredit', type: 'function', stateMutability: 'view', inputs: [
    { name: 'creditId', type: 'uint256' }
  ], outputs: [
    { name: 'id', type: 'uint256' }, { name: 'borrower', type: 'address' },
    { name: 'assetId', type: 'uint256' }, { name: 'principal', type: 'uint256' },
    { name: 'interest', type: 'uint256' }, { name: 'totalRepayment', type: 'uint256' },
    { name: 'amountRepaid', type: 'uint256' }, { name: 'startTime', type: 'uint256' },
    { name: 'dueDate', type: 'uint256' }, { name: 'status', type: 'uint8' }
  ] },
  { name: 'repayCredit', type: 'function', stateMutability: 'payable', inputs: [
    { name: 'creditId', type: 'uint256' }
  ], outputs: [] },
  { name: 'getPoolInfo', type: 'function', stateMutability: 'view', inputs: [], outputs: [
    { name: 'totalLiquidity', type: 'uint256' }, { name: 'totalBorrowed', type: 'uint256' },
    { name: 'availableLiquidity', type: 'uint256' }, { name: 'utilizationRate', type: 'uint256' },
    { name: 'annualInterestRate', type: 'uint256' }
  ] },
  { name: 'liquidityProviders', type: 'function', stateMutability: 'view', inputs: [
    { name: 'provider', type: 'address' }
  ], outputs: [{ type: 'uint256' }] },
];

const SCRAPER_API = 'http://localhost:3001';

function normalizeLocationKey(key: string): string {
  return key
    .replace(/İ/g, 'I').replace(/ı/g, 'i')
    .replace(/Ş/g, 'S').replace(/ş/g, 's')
    .replace(/Ğ/g, 'G').replace(/ğ/g, 'g')
    .replace(/Ü/g, 'U').replace(/ü/g, 'u')
    .replace(/Ö/g, 'O').replace(/ö/g, 'o')
    .replace(/Ç/g, 'C').replace(/ç/g, 'c');
}

function getCityCode(cityName: string): number {
  const cityMap: Record<string, number> = {
    'Adana': 0, 'Adıyaman': 1, 'Afyonkarahisar': 2, 'Ağrı': 3, 'Amasya': 4,
    'Ankara': 5, 'Antalya': 6, 'Artvin': 7, 'Aydın': 8, 'Balıkesir': 9,
    'Bilecik': 10, 'Bingöl': 11, 'Bitlis': 12, 'Bolu': 13, 'Burdur': 14,
    'Bursa': 15, 'Çanakkale': 16, 'Çankırı': 17, 'Çorum': 18, 'Denizli': 19,
    'Diyarbakır': 20, 'Edirne': 21, 'Elazığ': 22, 'Erzincan': 23, 'Erzurum': 24,
    'Eskişehir': 25, 'Gaziantep': 26, 'Giresun': 27, 'Gümüşhane': 28, 'Hakkari': 29,
    'Hatay': 30, 'Isparta': 31, 'Mersin': 32, 'İstanbul': 33, 'İzmir': 34,
    'Kars': 35, 'Kastamonu': 36, 'Kayseri': 37, 'Kırklareli': 38, 'Kırşehir': 39,
    'Kocaeli': 40, 'Konya': 41, 'Kütahya': 42, 'Malatya': 43, 'Manisa': 44,
    'Kahramanmaraş': 45, 'Mardin': 46, 'Muğla': 47, 'Muş': 48, 'Nevşehir': 49,
    'Niğde': 50, 'Ordu': 51, 'Rize': 52, 'Sakarya': 53, 'Samsun': 54,
    'Siirt': 55, 'Sinop': 56, 'Sivas': 57, 'Tekirdağ': 58, 'Tokat': 59,
    'Trabzon': 60, 'Tunceli': 61, 'Şanlıurfa': 62, 'Uşak': 63, 'Van': 64,
    'Yozgat': 65, 'Zonguldak': 66, 'Aksaray': 67, 'Bayburt': 68, 'Karaman': 69,
    'Kırıkkale': 70, 'Batman': 71, 'Şırnak': 72, 'Bartın': 73, 'Ardahan': 74,
    'Iğdır': 75, 'Yalova': 76, 'Karabük': 77, 'Kilis': 78, 'Osmaniye': 79, 'Düzce': 80
  };
  return cityMap[cityName] ?? 33;
}

interface ValuationResult {
  isLiveScraped?: boolean;
  estimatedValueUSD?: number;
  estimatedValueTL?: number;
  pricePerSqmTL?: number;
  sampleSize?: number;
  confidence?: string;
  creditLimit70?: number;
  creditLimit50?: number;
  sources?: string[];
  error?: string;
}

export default function VarlikEklePage() {
  const { isConnected, address } = useAccount();
  const [assetType, setAssetType] = useState('property');
  const [step, setStep] = useState('form');
  const [valuationProgress, setValuationProgress] = useState(0);
  const [valuationMessage, setValuationMessage] = useState('');
  const [valuationResult, setValuationResult] = useState<ValuationResult | null>(null);
  const [valuationError, setValuationError] = useState<string | null>(null);
  const [registeredAssetId, setRegisteredAssetId] = useState<number | null>(null);

  const [collateralStep, setCollateralStep] = useState<'idle' | 'minting' | 'borrowing' | 'done' | 'error'>('idle');
  const [collateralError, setCollateralError] = useState<string | null>(null);
  const [borrowAmount, setBorrowAmount] = useState('');
  const [oracleTxHash, setOracleTxHash] = useState<string | null>(null);
  const [linkSent, setLinkSent] = useState(false);
  const [expectedAssetId, setExpectedAssetId] = useState<number | null>(null);

  const { writeContract: writeRegistry, data: registryHash, isPending: isRegistryPending, error: registryError } = useWriteContract();
  const { writeContract: writeOracle, data: oracleHash, isPending: isOraclePending, error: oracleWriteError } = useWriteContract();
  const { writeContract: writeMint, data: mintHash, isPending: isMintPending, error: mintError } = useWriteContract();
  const { writeContract: writePool, data: poolHash, isPending: isPoolPending, error: poolError } = useWriteContract();

  const { isLoading: isRegistryConfirming, isSuccess: isRegistryConfirmed } = useWaitForTransactionReceipt({ hash: registryHash });
  const { isLoading: isOracleConfirming, isSuccess: isOracleConfirmed, isError: isOracleError } = useWaitForTransactionReceipt({ hash: oracleHash });
  const { isLoading: isMintConfirming, isSuccess: isMintConfirmed, isError: isMintReceiptError } = useWaitForTransactionReceipt({ hash: mintHash });
  const { isLoading: isPoolConfirming, isSuccess: isPoolConfirmed, isError: isPoolError } = useWaitForTransactionReceipt({ hash: poolHash });

  const { data: poolInfo } = useReadContract({
    address: CONTRACTS.CreditPool as `0x${string}`,
    abi: CREDIT_POOL_ABI,
    functionName: 'getPoolInfo',
  }) as { data: [bigint, bigint, bigint, bigint, bigint] | undefined };

  const { data: valuationId } = useReadContract({
    address: CONTRACTS.ValuationOracle as `0x${string}`,
    abi: VALUATION_ORACLE_ABI,
    functionName: 'assetValuations',
    args: registeredAssetId ? [BigInt(registeredAssetId)] : undefined,
    query: { enabled: !!registeredAssetId && isOracleConfirmed },
  });

  const { data: nftOwner, isError: isNftOwnerError, refetch: refetchNftOwner } = useReadContract({
    address: CONTRACTS.RWAToken as `0x${string}`,
    abi: RWA_TOKEN_ABI,
    functionName: 'ownerOf',
    args: registeredAssetId ? [BigInt(registeredAssetId)] : undefined,
    query: { enabled: !!registeredAssetId && !!address, refetchInterval: collateralStep === 'minting' || collateralStep === 'borrowing' ? 3000 : false },
  });

  const isNftMinted = !!nftOwner && !isNftOwnerError;

  const { data: poolInfo2 } = useReadContract({
    address: CONTRACTS.CreditPool as `0x${string}`,
    abi: CREDIT_POOL_ABI,
    functionName: 'getPoolInfo',
  });

  const { data: assetCounter } = useReadContract({
    address: CONTRACTS.RWARegistry as `0x${string}`,
    abi: RWA_REGISTRY_ABI,
    functionName: 'getAssetCounter',
  });

  const [propertyForm, setPropertyForm] = useState({
    city: '', district: '', neighborhood: '', plotNumber: '',
    parcelNumber: '', area: '', propertyType: 'residence', titleDeedType: '0', locationData: '',
  });

  const [provinces, setProvinces] = useState<{ id: number; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: number; name: string }[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);

  useEffect(() => {
    fetch('https://api.turkiyeapi.dev/v1/provinces?fields=id,name')
      .then(r => r.json())
      .then(data => { setProvinces(data.data || []); setLoadingProvinces(false); })
      .catch(() => setLoadingProvinces(false));
  }, []);

  useEffect(() => {
    if (!propertyForm.city) { setDistricts([]); setNeighborhoods([]); return; }
    const province = provinces.find(p => p.name === propertyForm.city);
    if (!province) return;
    setLoadingDistricts(true);
    fetch(`https://api.turkiyeapi.dev/v1/districts?provinceId=${province.id}&fields=id,name`)
      .then(r => r.json()).then(data => { setDistricts(data.data || []); setLoadingDistricts(false); })
      .catch(() => setLoadingDistricts(false));
  }, [propertyForm.city, provinces]);

  useEffect(() => {
    if (!propertyForm.district) { setNeighborhoods([]); return; }
    const district = districts.find(d => d.name === propertyForm.district);
    if (!district) return;
    setLoadingNeighborhoods(true);
    fetch(`https://api.turkiyeapi.dev/v1/neighborhoods?districtId=${district.id}&fields=name`)
      .then(r => r.json()).then(data => { setNeighborhoods((data.data || []).map((n: any) => n.name)); setLoadingNeighborhoods(false); })
      .catch(() => setLoadingNeighborhoods(false));
  }, [propertyForm.district, districts]);

  const [vehicleForm, setVehicleForm] = useState({
    brand: '', model: '', year: '2022', mileage: '50000', fuelType: 'Hybrid',
  });

  const [vehicleMakes, setVehicleMakes] = useState<{ id: number; name: string }[]>([]);
  const [vehicleModels, setVehicleModels] = useState<{ id: number; name: string }[]>([]);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  const TURKEY_VEHICLES: Record<string, string[]> = {
    'Alfa Romeo': ['Giulia', 'Stelvio', 'Tonale'],
    'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'Q3', 'Q5', 'Q7', 'e-tron'],
    'BMW': ['1 Serisi', '3 Serisi', '4 Serisi', '5 Serisi', '7 Serisi', 'X1', 'X3', 'X5', 'X6', 'i4', 'iX', 'Z4'],
    'BYD': ['Atto 3', 'Han', 'Tang', 'Dolphin', 'Seal'],
    'Chery': ['Tiggo 7', 'Tiggo 8', 'Omoda 5', 'Tiggo 4'],
    'Citroen': ['C3', 'C4', 'C5', 'C3 Aircross', 'C5 Aircross', 'Berlingo', 'Ami'],
    'Cupra': ['Leon', 'Formentor', 'Born', 'Ateca', 'Tavascan'],
    'Dacia': ['Duster', 'Sandero', 'Logan', 'Jogger', 'Spring'],
    'DS': ['DS 3', 'DS 4', 'DS 7'],
    'Fiat': ['Egea', '500', '500X', '500L', 'Panda', 'Tipo', 'Doblo', 'Fiorino', 'Scudo'],
    'Ford': ['Focus', 'Fiesta', 'Kuga', 'Puma', 'Mondeo', 'Ranger', 'EcoSport', 'Tourneo', 'Transit'],
    'Honda': ['Civic', 'CR-V', 'HR-V', 'Jazz', 'City', 'ZR-V'],
    'Hyundai': ['i10', 'i20', 'i30', 'Accent', 'Elantra', 'Tucson', 'Santa Fe', 'Kona', 'Bayon', 'IONIQ 5', 'IONIQ 6'],
    'Jeep': ['Compass', 'Renegade', 'Cherokee', 'Wrangler', 'Grand Cherokee', 'Avenger'],
    'Kia': ['Rio', 'Ceed', 'Sportage', 'Sorento', 'Niro', 'Stonic', 'Picanto', 'EV6', 'XCeed'],
    'Land Rover': ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Evoque', 'Range Rover Velar', 'Range Rover Sport'],
    'Lexus': ['UX', 'NX', 'RX', 'IS', 'ES', 'LBX'],
    'Mazda': ['Mazda2', 'Mazda3', 'Mazda6', 'CX-3', 'CX-5', 'CX-30', 'MX-5'],
    'Mercedes-Benz': ['A Serisi', 'C Serisi', 'E Serisi', 'S Serisi', 'CLA', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'EQA', 'EQB', 'EQC', 'EQE', 'EQS', 'Vito', 'Sprinter'],
    'MG': ['ZS', 'HS', 'Marvel R', 'MG4', 'MG5', 'RX8'],
    'Mini': ['Cooper', 'Countryman', 'Clubman', 'Aceman'],
    'Mitsubishi': ['Eclipse Cross', 'ASX', 'Space Star', 'L200', 'Outlander'],
    'Nissan': ['Qashqai', 'Juke', 'X-Trail', 'Micra', 'Leaf', 'Note', 'Townstar'],
    'Opel': ['Astra', 'Corsa', 'Mokka', 'Grandland', 'Crossland', 'Insignia', 'Combo', 'Zafira', 'Vivaro'],
    'Peugeot': ['208', '308', '508', '2008', '3008', '5008', 'Rifter', 'Partner', 'e-208', 'e-308'],
    'Porsche': ['Cayenne', 'Macan', 'Panamera', 'Taycan', '911'],
    'Renault': ['Clio', 'Megane', 'Kadjar', 'Captur', 'Symbol', 'Talisman', 'Koleos', 'Austral', 'Arkana', 'Master', 'Express'],
    'Seat': ['Leon', 'Ibiza', 'Arona', 'Ateca', 'Tarraco'],
    'Seres': ['3', '5'],
    'Skoda': ['Octavia', 'Superb', 'Karoq', 'Kodiaq', 'Fabia', 'Scala', 'Kamiq', 'Enyaq'],
    'Subaru': ['Outback', 'Forester', 'XV', 'Crosstrek'],
    'Suzuki': ['Swift', 'Vitara', 'S-Cross', 'Ignis', 'Jimny', 'Baleno'],
    'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X'],
    'Togg': ['T10X', 'T10F'],
    'Toyota': ['Corolla', 'Yaris', 'C-HR', 'RAV4', 'Camry', 'Hilux', 'Land Cruiser', 'Proace', 'Supra', 'bZ4X'],
    'Volkswagen': ['Golf', 'Passat', 'Tiguan', 'Polo', 'Jetta', 'T-Roc', 'T-Cross', 'Taigo', 'ID.3', 'ID.4', 'ID.5', 'ID.Buzz', 'Amarok', 'Caddy', 'Crafter', 'Multivan', 'Touran'],
    'Volvo': ['XC40', 'XC60', 'XC90', 'V40', 'V60', 'S60', 'S90', 'C40'],
  };

  useEffect(() => {
    const makes = Object.keys(TURKEY_VEHICLES).sort();
    setVehicleMakes(makes.map((name, i) => ({ id: i, name })));
  }, []);

  useEffect(() => {
    if (!vehicleForm.brand) { setVehicleModels([]); return; }
    const models = TURKEY_VEHICLES[vehicleForm.brand] || [];
    setVehicleModels(models.map((name, i) => ({ id: i, name })));
  }, [vehicleForm.brand]);

  const handlePropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    oracleTriggeredRef.current = false;
    setExpectedAssetId(Number(assetCounter || 0) + 1);
    setStep('registering');
    writeRegistry({
      address: CONTRACTS.RWARegistry,
      abi: RWA_REGISTRY_ABI,
      functionName: 'registerRealEstate',
      args: [
        getCityCode(propertyForm.city), propertyForm.district, propertyForm.neighborhood,
        BigInt(propertyForm.plotNumber || 0), BigInt(propertyForm.parcelNumber || 0),
        BigInt(propertyForm.area || 100), 0, 0, propertyForm.locationData || 'Test',
      ],
    });
  };

  const handleVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    oracleTriggeredRef.current = false;
    setExpectedAssetId(Number(assetCounter || 0) + 1);
    setStep('registering');
    writeRegistry({
      address: CONTRACTS.RWARegistry,
      abi: RWA_REGISTRY_ABI,
      functionName: 'registerVehicle',
      args: [
        'RWA-' + Date.now(), 'RWA-CHASSIS-' + Date.now(),
        vehicleForm.brand, vehicleForm.model, BigInt(vehicleForm.year),
        BigInt(vehicleForm.mileage), vehicleForm.fuelType,
      ],
    });
  };

  const startLiveValuation = () => {
    setValuationProgress(0);
    setValuationMessage('');
    setValuationResult(null);
    setValuationError(null);

    const endpoint = assetType === 'property' ? '/api/valuation/property' : '/api/valuation/vehicle';
    const body = assetType === 'property' ? {
      city: propertyForm.city, district: propertyForm.district,
      area: parseInt(propertyForm.area) || 100, propertyType: propertyForm.propertyType,
    } : {
      brand: vehicleForm.brand, model: vehicleForm.model,
      year: parseInt(vehicleForm.year), km: parseInt(vehicleForm.mileage) || 0,
    };

    fetch(SCRAPER_API + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(async (response) => {
      if (!response.body) { setValuationError('Sunucu yanıt vermedi'); setStep('done'); return; }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines2 = buffer.split('\n');
        buffer = lines2.pop() || '';
        for (const line of lines2) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              setValuationProgress(data.progress || 0);
              setValuationMessage(data.message || '');
              if (data.data && data.progress === 100) {
                if (data.data.error) { setValuationError(data.data.error); setStep('done'); } else { setValuationResult(data.data); setStep('saving-valuation'); }
              }
            } catch(e) {}
          }
        }
      }
    }).catch((e) => {
      console.error('Valuation fetch error:', e);
      setValuationError('Bağlantı hatası: ' + e.message);
      setStep('done');
    });
  };

  useEffect(() => {
    if (isRegistryConfirmed && step === 'registering') {
      if (expectedAssetId && expectedAssetId > 0) {
        setRegisteredAssetId(expectedAssetId);
        setStep('valuation');
        startLiveValuation();
      }
    }
  }, [isRegistryConfirmed, step, expectedAssetId]);

  const oracleTriggeredRef = useRef(false);

  useEffect(() => {
    if (step === 'saving-valuation' && valuationResult && registeredAssetId && !oracleTxHash && !oracleTriggeredRef.current) {
      oracleTriggeredRef.current = true;
      const scrapedValueUSD = valuationResult.estimatedValueUSD || valuationResult.estimatedValueTL || 0;
      const scrapedValueWei = BigInt(Math.round(scrapedValueUSD * 1e18));
      writeOracle({
        address: CONTRACTS.ValuationOracle as `0x${string}`,
        abi: VALUATION_ORACLE_ABI,
        functionName: 'submitManualValuation',
        args: [BigInt(registeredAssetId), scrapedValueWei, 'scraping'],
      });
    }
  }, [step, valuationResult, registeredAssetId, oracleTxHash]);

  useEffect(() => {
    if (oracleWriteError) {
      console.error('Oracle writeContract error:', oracleWriteError);
      setValuationError('Değerleme başlatılamadı: ' + (oracleWriteError?.message || 'Bilinmeyen hata'));
      setStep('done');
    }
  }, [oracleWriteError]);

  useEffect(() => {
    if (isOracleConfirmed && step === 'saving-valuation') {
      setOracleTxHash(oracleHash || '');
      setStep('linking-valuation');
    }
  }, [isOracleConfirmed, step, oracleHash]);

  useEffect(() => {
    if (step === 'linking-valuation' && valuationId && registeredAssetId && !linkSent) {
      setLinkSent(true);
      writeRegistry({
        address: CONTRACTS.RWARegistry as `0x${string}`,
        abi: RWA_REGISTRY_ABI,
        functionName: 'linkValuation',
        args: [BigInt(registeredAssetId), BigInt(valuationId as bigint)],
      });
    }
  }, [step, valuationId, registeredAssetId, linkSent, writeRegistry]);

  useEffect(() => {
    if (isRegistryConfirmed && step === 'linking-valuation' && linkSent) setStep('done');
  }, [isRegistryConfirmed, step, linkSent]);

  useEffect(() => {
    if (isOracleError && step === 'saving-valuation') {
      console.error('Oracle transaction error');
      setValuationError('Değerleme blockchain\'e kaydedilemedi. Lütfen tekrar deneyin.');
      setStep('done');
    }
  }, [isOracleError, step]);

  const handleMintToken = () => {
    if (!registeredAssetId || !address) return;
    setCollateralStep('minting');
    setCollateralError(null);
    writeMint({
      address: CONTRACTS.RWAToken,
      abi: RWA_TOKEN_ABI,
      functionName: 'mint',
      args: [address, BigInt(registeredAssetId), JSON.stringify({ assetId: registeredAssetId, type: assetType })],
    });
  };

  useEffect(() => {
    if (isMintConfirmed && collateralStep === 'minting') { refetchNftOwner(); setCollateralStep('borrowing'); }
  }, [isMintConfirmed, collateralStep, refetchNftOwner]);

  useEffect(() => {
    if (isMintReceiptError && collateralStep === 'minting') {
      setCollateralError('NFT mint işlemi başarısız oldu. Lütfen tekrar deneyin.'); setCollateralStep('error');
    }
  }, [isMintReceiptError, collateralStep]);

  const handleBorrow = async () => {
    if (!registeredAssetId || !borrowAmount) return;
    setCollateralStep('borrowing'); setCollateralError(null);
    try {
      const ethPriceUSD = 4000;
      const amountETH = parseFloat(borrowAmount) / ethPriceUSD;
      const amountWei = BigInt(Math.round(amountETH * 1e18));
      writePool({
        address: CONTRACTS.CreditPool,
        abi: CREDIT_POOL_ABI,
        functionName: 'drawCredit',
        args: [BigInt(registeredAssetId), amountWei],
      });
    } catch (err: any) {
      console.error('Kredi çekme hatası:', err);
      setCollateralError(err?.message || 'Kredi çekme işlemi başlatılamadı'); setCollateralStep('error');
    }
  };

  useEffect(() => {
    if (isPoolConfirmed && collateralStep === 'borrowing') setCollateralStep('done');
  }, [isPoolConfirmed, collateralStep]);

  useEffect(() => {
    if (isPoolError && collateralStep === 'borrowing') {
      setCollateralError('Kredi çekme işlemi başarısız oldu. Lütfen tekrar deneyin.'); setCollateralStep('error');
    }
  }, [isPoolError, collateralStep]);

  useEffect(() => {
    if (poolError && collateralStep === 'borrowing') {
      setCollateralError('Kredi çekme hatası: ' + (poolError?.message || 'İşlem reddedildi.')); setCollateralStep('error');
    }
  }, [poolError, collateralStep]);

  useEffect(() => {
    if (mintError && collateralStep === 'minting') {
      setCollateralError('NFT mint hatası: ' + (mintError?.message || 'İşlem reddedildi.')); setCollateralStep('error');
    }
  }, [mintError, collateralStep]);

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Cüzdan Bağlantısı Gerekli</h2>
          <p className="text-sm text-gray-500">Varlık eklemek için cüzdanınızı bağlayın.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-gray-900">Varlık Ekle</h1>
        <p className="text-gray-500 mt-1">Gayrimenkul veya araç kaydedin, anlık değerleme alın</p>
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <StepIcon label="Kayıt" completed={step !== 'form'} active={step === 'form'} />
          <div className={`flex-1 h-0.5 mx-3 transition-all duration-500 ${step !== 'form' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200'}`} />
          <StepIcon label="Değerleme" completed={step === 'done' || step === 'saving-valuation' || step === 'linking-valuation'} active={step === 'valuation'} />
          <div className={`flex-1 h-0.5 mx-3 transition-all duration-500 ${step === 'done' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200'}`} />
          <StepIcon label="Teminat" completed={false} active={step === 'done'} />
        </div>
      </div>

      {step === 'form' && (
        <>
          {/* Asset Type Toggle */}
          <div className="grid grid-cols-2 gap-3 mb-6 animate-slide-up">
            <button type="button" onClick={() => setAssetType('property')}
              className={`relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-200 card-hover ${
                assetType === 'property'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                assetType === 'property' ? 'bg-white/20' : 'bg-blue-100'
              }`}>
                <svg className={`w-5 h-5 ${assetType === 'property' ? 'text-white' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <p className="font-semibold">Gayrimenkul</p>
              <p className={`text-xs mt-1 ${assetType === 'property' ? 'text-blue-100' : 'text-gray-500'}`}>Konut, arsa, ticari</p>
            </button>
            <button type="button" onClick={() => setAssetType('vehicle')}
              className={`relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-200 card-hover ${
                assetType === 'vehicle'
                  ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-purple-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                assetType === 'vehicle' ? 'bg-white/20' : 'bg-purple-100'
              }`}>
                <svg className={`w-5 h-5 ${assetType === 'vehicle' ? 'text-white' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
              <p className="font-semibold">Araç</p>
              <p className={`text-xs mt-1 ${assetType === 'vehicle' ? 'text-purple-100' : 'text-gray-500'}`}>Otomobil, SUV, ticari</p>
            </button>
          </div>

          {assetType === 'property' ? (
            <form onSubmit={handlePropertySubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5 animate-slide-up">
              <div className="grid grid-cols-2 gap-4">
                <SearchableSelect
                  options={provinces.map(p => ({ id: p.id, name: p.name }))}
                  value={propertyForm.city} onChange={(val) => setPropertyForm({ ...propertyForm, city: val, district: '', neighborhood: '' })}
                  placeholder="İl seçin" required loading={loadingProvinces} label="İl"
                />
                <SearchableSelect
                  options={districts.map(d => ({ id: d.id, name: d.name }))}
                  value={propertyForm.district} onChange={(val) => setPropertyForm({ ...propertyForm, district: val, neighborhood: '' })}
                  placeholder="İlçe seçin" required disabled={!propertyForm.city} loading={loadingDistricts} label="İlçe"
                />
              </div>
              <SearchableSelect
                options={neighborhoods.map((n, i) => ({ id: i, name: n }))}
                value={propertyForm.neighborhood} onChange={(val) => setPropertyForm({ ...propertyForm, neighborhood: val })}
                placeholder="Mahalle seçin" required disabled={!propertyForm.district} loading={loadingNeighborhoods} label="Mahalle"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ada (isteğe bağlı)</label>
                  <input type="number" value={propertyForm.plotNumber} onChange={(e) => setPropertyForm({ ...propertyForm, plotNumber: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Parsel (isteğe bağlı)</label>
                  <input type="number" value={propertyForm.parcelNumber} onChange={(e) => setPropertyForm({ ...propertyForm, parcelNumber: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Alan (m²)</label>
                  <input type="number" value={propertyForm.area} onChange={(e) => setPropertyForm({ ...propertyForm, area: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Varlık Tipi</label>
                  <select value={propertyForm.propertyType} onChange={(e) => setPropertyForm({ ...propertyForm, propertyType: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white">
                    <option value="residence">Konut</option>
                    <option value="commercial">Ticari</option>
                    <option value="land">Arsa</option>
                    <option value="farm">Tarla</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={isRegistryPending || isRegistryConfirming}
                className="w-full gradient-primary text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-all duration-200 shadow-md shadow-blue-600/20">
                {isRegistryPending || isRegistryConfirming ? (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>İşleniyor...</span>
                  </span>
                ) : 'Kaydet ve Değerlemeyi Başlat'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVehicleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5 animate-slide-up">
              <div className="grid grid-cols-2 gap-4">
                <SearchableSelect
                  options={vehicleMakes} value={vehicleForm.brand}
                  onChange={(val) => setVehicleForm({ ...vehicleForm, brand: val, model: '' })}
                  placeholder="Marka seçin" required loading={loadingMakes} label="Marka"
                />
                <SearchableSelect
                  options={vehicleModels} value={vehicleForm.model}
                  onChange={(val) => setVehicleForm({ ...vehicleForm, model: val })}
                  placeholder="Model seçin" required disabled={!vehicleForm.brand} loading={loadingModels} label="Model"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Yıl</label>
                  <input type="number" value={vehicleForm.year} onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kilometre</label>
                  <input type="number" value={vehicleForm.mileage} onChange={(e) => setVehicleForm({ ...vehicleForm, mileage: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Yakıt Tipi</label>
                  <select value={vehicleForm.fuelType} onChange={(e) => setVehicleForm({ ...vehicleForm, fuelType: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white">
                    <option value="Benzin">Benzin</option>
                    <option value="Dizel">Dizel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Elektrik">Elektrik</option>
                  </select>
                </div>
                <div></div>
              </div>
              <button type="submit" disabled={isRegistryPending || isRegistryConfirming}
                className="w-full gradient-primary text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-all duration-200 shadow-md shadow-blue-600/20">
                {isRegistryPending || isRegistryConfirming ? (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>İşleniyor...</span>
                  </span>
                ) : 'Kaydet ve Değerlemeyi Başlat'}
              </button>
            </form>
          )}
        </>
      )}

      {/* Loading States */}
      {(step === 'registering' || (step === 'saving-valuation' && !isOraclePending && !isOracleConfirming && !isOracleError) || step === 'linking-valuation') && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="w-16 h-16 border-4 border-gray-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" />
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {step === 'registering' && "Blockchain'e kaydediliyor..."}
            {step === 'saving-valuation' && 'Değerleme kaydediliyor...'}
            {step === 'linking-valuation' && 'Değerleme varlığa bağlanıyor...'}
          </p>
          <p className="text-sm text-gray-500 mt-2">İşlemi cüzdanınızda onaylayın</p>
          {registryHash && <p className="text-xs text-gray-400 mt-3 break-all font-mono bg-gray-50 p-2 rounded-lg">Tx: {registryHash}</p>}
        </div>
      )}

      {step === 'saving-valuation' && isOraclePending && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="w-16 h-16 border-4 border-gray-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" />
          </div>
          <p className="text-lg font-semibold text-gray-900">Cüzdan onayı bekleniyor...</p>
          <p className="text-sm text-gray-500 mt-2">İşlemi cüzdanınızda onaylayın</p>
        </div>
      )}

      {step === 'saving-valuation' && !isOraclePending && isOracleConfirming && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="w-16 h-16 border-4 border-gray-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-green-500 rounded-full animate-spin" />
          </div>
          <p className="text-lg font-semibold text-gray-900">Blockchain'e kaydediliyor...</p>
          {oracleHash && <p className="text-xs text-gray-400 mt-3 break-all font-mono bg-gray-50 p-2 rounded-lg">Tx: {oracleHash}</p>}
        </div>
      )}

      {step === 'saving-valuation' && isOracleError && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-100 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-red-600">Değerleme kaydedilemedi</p>
          <p className="text-sm text-gray-500 mt-2">Lütfen tekrar deneyin</p>
          <button onClick={() => { setStep('done'); setValuationError('Değerleme blockchain\'e kaydedilemedi.'); }}
            className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-all font-medium">
            Geri Dön
          </button>
        </div>
      )}

      {step === 'valuation' && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Canlı Değerleme</h2>
          <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
            <div className="gradient-primary h-3 rounded-full transition-all duration-700 ease-out flex items-center justify-center text-xs text-white font-medium shadow-sm"
              style={{ width: valuationProgress + '%' }}>
              {valuationProgress > 15 ? valuationProgress + '%' : ''}
            </div>
          </div>
          <p className="text-sm font-medium text-blue-600 mb-4">{valuationMessage}</p>
          <div className="flex items-center space-x-3 text-sm text-gray-500 bg-blue-50 p-3 rounded-xl">
            <svg className="w-5 h-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Canlı piyasa verileri taranıyor...</span>
          </div>
        </div>
      )}

      {step === 'done' && valuationResult && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Değerleme Tamamlandı</h2>
              <p className="text-sm text-gray-500 mt-2">Değerleme blockchain başarıyla kaydedildi</p>
              <div className="flex items-center justify-center space-x-2 mt-3">
                {valuationResult.isLiveScraped ? (
                  <span className="inline-flex items-center space-x-1 bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    <span>Canlı Veri</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full font-medium">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" /></svg>
                    <span>Tahmini</span>
                  </span>
                )}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-6 text-white mb-6">
              <p className="text-sm text-blue-100 mb-1">Tahmini Değer</p>
              <p className="text-4xl font-bold">
                {valuationResult.estimatedValueUSD
                  ? valuationResult.estimatedValueUSD.toLocaleString() + ' USD'
                  : valuationResult.estimatedValueTL
                  ? valuationResult.estimatedValueTL.toLocaleString() + ' TL'
                  : 'N/A'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-4 rounded-xl"><p className="text-xs text-gray-500 mb-1">Örnek Sayısı</p><p className="font-semibold text-gray-900">{valuationResult.sampleSize || 0} ilan</p></div>
              <div className="bg-gray-50 p-4 rounded-xl"><p className="text-xs text-gray-500 mb-1">Güven Seviyesi</p><p className="font-semibold capitalize text-gray-900">{valuationResult.confidence || 'N/A'}</p></div>
              <div className="bg-gray-50 p-4 rounded-xl"><p className="text-xs text-gray-500 mb-1">m² Birim Fiyat</p><p className="font-semibold text-gray-900">{valuationResult.pricePerSqmTL ? valuationResult.pricePerSqmTL.toLocaleString() + ' TL/m²' : 'N/A'}</p></div>
              <div className="bg-gray-50 p-4 rounded-xl"><p className="text-xs text-gray-500 mb-1">Kredi Limiti (%50)</p><p className="font-semibold text-green-600">{valuationResult.creditLimit50 ? valuationResult.creditLimit50.toLocaleString() + ' USD' : 'N/A'}</p></div>
            </div>
          </div>

          {collateralStep === 'idle' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Teminat Olarak Kullan</h3>
              <p className="text-sm text-gray-500 mb-6">Varlığınızı teminat göstererek kredi havuzundan borç alabilirsiniz.</p>
              {!isNftMinted ? (
                <button onClick={handleMintToken} className="w-full gradient-primary text-white py-3 rounded-xl font-medium hover:opacity-90 transition-all shadow-md shadow-blue-600/20">
                  NFT Mintle ve Teminat Olarak Kullan
                </button>
              ) : (
                <button onClick={() => { setCollateralStep('borrowing'); setCollateralError(null); }}
                  className="w-full gradient-primary text-white py-3 rounded-xl font-medium hover:opacity-90 transition-all shadow-md shadow-blue-600/20">
                  Kredi Çek
                </button>
              )}
            </div>
          )}

          {collateralStep === 'minting' && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              {isMintPending ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 relative">
                    <div className="w-16 h-16 border-4 border-gray-100 rounded-full" />
                    <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900">Cüzdan onayı bekleniyor...</p>
                </>
              ) : isMintConfirming ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 relative">
                    <div className="w-16 h-16 border-4 border-gray-100 rounded-full" />
                    <div className="absolute inset-0 border-4 border-transparent border-t-green-500 rounded-full animate-spin" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900">Blockchain'e kaydediliyor...</p>
                  {mintHash && <p className="text-xs text-gray-400 mt-3 break-all font-mono bg-gray-50 p-2 rounded-lg">Tx: {mintHash}</p>}
                </>
              ) : isMintConfirmed ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-green-600">NFT başarıyla mintlendi!</p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 relative">
                    <div className="w-16 h-16 border-4 border-gray-100 rounded-full" />
                    <div className="absolute inset-0 border-4 border-transparent border-t-green-500 rounded-full animate-spin" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900">NFT mintleniyor...</p>
                  {mintHash && <p className="text-xs text-gray-400 mt-3 break-all font-mono bg-gray-50 p-2 rounded-lg">Tx: {mintHash}</p>}
                </>
              )}
            </div>
          )}

          {collateralStep === 'error' && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-100 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-600 mb-6">{collateralError || 'Bir hata oluştu'}</p>
              <button onClick={() => { setCollateralStep('idle'); setCollateralError(null); }}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-all font-medium">
                Tekrar Dene
              </button>
            </div>
          )}

          {collateralStep === 'borrowing' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kredi Çek</h3>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-5">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                  </svg>
                  <p className="text-sm text-amber-800">Kredi çekildiğinde varlığınız otomatik olarak teminat olarak kilitlenecektir.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-xs text-blue-600 mb-1">Kredi Limiti</p>
                  <p className="font-bold text-blue-800">{valuationResult.creditLimit70 || valuationResult.creditLimit50 || 0} USD</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <p className="text-xs text-purple-600 mb-1">Havuz Likiditesi</p>
                  <p className="font-bold text-purple-800">{poolInfo ? Number(poolInfo[2]) / 1e18 : 0} ETH</p>
                </div>
              </div>
              {isPoolPending || isPoolConfirming ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 mx-auto mb-3 relative">
                    <div className="w-12 h-12 border-4 border-gray-100 rounded-full" />
                    <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" />
                  </div>
                  <p className="text-sm text-gray-600">{isPoolPending ? 'Cüzdan onayı bekleniyor...' : "Blockchain'e kaydediliyor..."}</p>
                  {poolHash && <p className="text-xs text-gray-400 mt-2 break-all font-mono bg-gray-50 p-2 rounded-lg">Tx: {poolHash}</p>}
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Miktar (USD)</label>
                    <div className="flex space-x-2">
                      <input type="number" value={borrowAmount} onChange={(e) => setBorrowAmount(e.target.value)}
                        className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="40 - 50000 USD" />
                      <button onClick={() => setBorrowAmount(String(valuationResult.creditLimit70 || valuationResult.creditLimit50 || 0))}
                        className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">
                        Max
                      </button>
                    </div>
                    {borrowAmount && (
                      <p className="text-xs text-gray-500 mt-2">≈ {(parseFloat(borrowAmount) / 4000).toFixed(6)} ETH (1 ETH ≈ 4000 USD)</p>
                    )}
                    {borrowAmount && parseFloat(borrowAmount) < 40 && (
                      <p className="text-xs text-red-500 mt-1">Minimum 40 USD çekilebilir</p>
                    )}
                  </div>
                  <button onClick={handleBorrow} disabled={!borrowAmount || parseFloat(borrowAmount) < 40 || isPoolPending}
                    className="w-full gradient-primary text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-blue-600/20">
                    Kredi Çek
                  </button>
                </>
              )}
            </div>
          )}

          {collateralStep === 'done' && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Kredi Başarıyla Çekildi!</h2>
              <p className="text-gray-500 mt-2">ETH cüzdanınıza aktarıldı.</p>
              <div className="mt-8 flex space-x-4 justify-center">
                <a href="/varliklarim" className="gradient-primary text-white px-8 py-3 rounded-xl font-medium hover:opacity-90 transition-all shadow-md shadow-blue-600/20">
                  Varlıklarım
                </a>
                <button onClick={() => { setStep('form'); setValuationResult(null); setCollateralStep('idle'); setBorrowAmount(''); setCollateralError(null); setLinkSent(false); }}
                  className="bg-white text-blue-600 px-8 py-3 rounded-xl font-medium border-2 border-blue-200 hover:border-blue-400 transition-all">
                  Yeni Varlık Ekle
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 'done' && valuationError && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-100 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-600 mb-6">{valuationError}</p>
          <button onClick={() => { setStep('form'); setValuationError(null); setLinkSent(false); }}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-all font-medium">
            Tekrar Dene
          </button>
        </div>
      )}
    </div>
  );
}
