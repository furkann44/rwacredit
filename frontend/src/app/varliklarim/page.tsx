'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '@/lib/constants';

const RWA_REGISTRY_ABI = [
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
];

const RWA_TOKEN_ABI = [
  { name: 'mint', type: 'function', stateMutability: 'nonpayable', inputs: [
    { name: 'to', type: 'address' }, { name: 'tokenId', type: 'uint256' }, { name: 'metadataUri', type: 'string' }
  ], outputs: [{ type: 'uint256' }] },
  { name: 'isLocked', type: 'function', stateMutability: 'view', inputs: [
    { name: 'tokenId', type: 'uint256' }
  ], outputs: [{ type: 'bool' }] },
  { name: 'ownerOf', type: 'function', stateMutability: 'view', inputs: [
    { name: 'tokenId', type: 'uint256' }
  ], outputs: [{ type: 'address' }] },
  { name: 'getTotalSupply', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
];

const CREDIT_POOL_ABI = [
  { name: 'drawCredit', type: 'function', stateMutability: 'nonpayable', inputs: [
    { name: 'assetId', type: 'uint256' }, { name: 'amount', type: 'uint256' }
  ], outputs: [{ type: 'uint256' }] },
  { name: 'getCredit', type: 'function', stateMutability: 'view', inputs: [
    { name: 'creditId', type: 'uint256' }
  ], outputs: [
    { name: 'id', type: 'uint256' }, { name: 'borrower', type: 'address' },
    { name: 'assetId', type: 'uint256' }, { name: 'principal', type: 'uint256' },
    { name: 'interest', type: 'uint256' }, { name: 'totalRepayment', type: 'uint256' },
    { name: 'amountRepaid', type: 'uint256' }, { name: 'startTime', type: 'uint256' },
    { name: 'dueDate', type: 'uint256' }, { name: 'status', type: 'uint8' }
  ] },
  { name: 'depositLiquidity', type: 'function', stateMutability: 'payable', inputs: [], outputs: [] },
  { name: 'withdrawLiquidity', type: 'function', stateMutability: 'nonpayable', inputs: [
    { name: 'amount', type: 'uint256' }
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

const STATUS_MAP: Record<number, { label: string; color: string; icon: string }> = {
  0: { label: 'Beklemede', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'M12 8v4m0 4h.01' },
  1: { label: 'Değerlendi', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  2: { label: 'Kilitli', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  3: { label: 'Tasfiye', color: 'bg-red-50 text-red-700 border-red-200', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z' },
  4: { label: 'Serbest', color: 'bg-green-50 text-green-700 border-green-200', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
};

const TYPE_LABELS: Record<number, string> = { 0: 'Gayrimenkul', 1: 'Araç' };
const TYPE_ICONS: Record<number, string> = {
  0: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  1: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
};

export default function VarliklarimPage() {
  const { isConnected, address } = useAccount();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const { data: rawAssetIds, isLoading: loadingIds, refetch: refetchAssets } = useReadContract({
    address: CONTRACTS.RWARegistry as `0x${string}`,
    abi: RWA_REGISTRY_ABI,
    functionName: 'getUserAssets',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const assetIds = (rawAssetIds as bigint[] | undefined) || [];
  const totalPages = Math.ceil(assetIds.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedIds = assetIds.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
          <p className="text-sm text-gray-500">Varlıklarınızı görüntülemek için cüzdanınızı bağlayın.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Varlıklarım</h1>
          <p className="text-gray-500 mt-1">{assetIds.length} kayıtlı varlık</p>
        </div>
        <button onClick={() => refetchAssets()}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Yenile</span>
        </button>
      </div>

      {loadingIds ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="skeleton h-5 w-32 rounded-lg" />
                  <div className="skeleton h-4 w-24 rounded-lg" />
                  <div className="skeleton h-3 w-48 rounded-lg" />
                </div>
                <div className="skeleton h-8 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : assetIds.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={TYPE_ICONS[0]} />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz varlık yok</h3>
          <p className="text-gray-500 mb-6">Başlamak için bir gayrimenkul veya araç ekleyin.</p>
          <a href="/varlik-ekle" className="gradient-primary text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-all shadow-md shadow-blue-600/20 inline-block">
            Varlık Ekle
          </a>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedIds.map((id: bigint) => (
              <AssetCard key={Number(id)} assetId={Number(id)} onActionComplete={() => refetchAssets()} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-all text-sm">
                Önceki
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                    page === currentPage ? 'gradient-primary text-white shadow-md' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-all text-sm">
                Sonraki
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AssetCard({ assetId, onActionComplete }: { assetId: number; onActionComplete: () => void }) {
  const { address } = useAccount();
  const [actionStep, setActionStep] = useState<string | null>(null);
  const [borrowAmount, setBorrowAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [oracleReady, setOracleReady] = useState(false);
  const [oracleArgs, setOracleArgs] = useState<any>(null);
  const [borrowSuccess, setBorrowSuccess] = useState(false);

  const { data: assetData, isLoading, refetch: refetchAsset } = useReadContract({
    address: CONTRACTS.RWARegistry as `0x${string}`,
    abi: RWA_REGISTRY_ABI,
    functionName: 'getAsset',
    args: [BigInt(assetId)],
    query: { refetchInterval: actionStep ? 3000 : false },
  });

  const { data: oracleData, refetch: refetchOracleData } = useReadContract({
    address: CONTRACTS.ValuationOracle as `0x${string}`,
    abi: VALUATION_ORACLE_ABI,
    functionName: 'getAssetValuation',
    args: [BigInt(assetId)],
    query: { enabled: !!assetData, refetchInterval: actionStep === 'oracle' ? 3000 : false },
  });

  const { data: nftOwner, isError: isNftOwnerError, refetch: refetchNftOwner } = useReadContract({
    address: CONTRACTS.RWAToken as `0x${string}`,
    abi: RWA_TOKEN_ABI,
    functionName: 'ownerOf',
    args: [BigInt(assetId)],
    query: { enabled: !!address, refetchInterval: actionStep === 'mint' || actionStep === 'borrow' ? 3000 : false },
  });

  const { data: poolInfo } = useReadContract({
    address: CONTRACTS.CreditPool as `0x${string}`,
    abi: CREDIT_POOL_ABI,
    functionName: 'getPoolInfo',
  }) as { data: [bigint, bigint, bigint, bigint, bigint] | undefined };

  const { data: creditData } = useReadContract({
    address: CONTRACTS.CreditPool as `0x${string}`,
    abi: CREDIT_POOL_ABI,
    functionName: 'getCredit',
    args: assetData ? [BigInt(Number((assetData as [bigint, bigint, bigint, string, bigint, bigint, bigint])[6]))] : undefined,
    query: { enabled: !!assetData && Number((assetData as [bigint, bigint, bigint, string, bigint, bigint, bigint])[6]) > 0 },
  }) as { data: [bigint, string, bigint, bigint, bigint, bigint, bigint, bigint, bigint, number] | undefined };

  const hasOracleValuation = !!(oracleData && (oracleData as [bigint, boolean])[1] === true);
  const oracleValue = hasOracleValuation ? Number((oracleData as [bigint, boolean])[0]) / 1e18 : 0;
  const isNftMinted = !!nftOwner && !isNftOwnerError;

  const { writeContract: writeOracle, data: oracleHash, isPending: isOraclePending, error: oracleError } = useWriteContract();
  const { writeContract: writeMint, data: mintHash, isPending: isMintPending, error: mintError } = useWriteContract();
  const { writeContract: writePool, data: poolHash, isPending: isPoolPending, error: poolError } = useWriteContract();

  const { isSuccess: isOracleConfirmed, isLoading: isOracleConfirming, isError: isOracleReceiptError } = useWaitForTransactionReceipt({ hash: oracleHash });
  const { isSuccess: isMintConfirmed, isLoading: isMintConfirming, isError: isMintReceiptError } = useWaitForTransactionReceipt({ hash: mintHash });
  const { isSuccess: isPoolConfirmed, isLoading: isPoolConfirming, isError: isPoolReceiptError } = useWaitForTransactionReceipt({ hash: poolHash });

  useEffect(() => {
    if (oracleReady && oracleArgs && actionStep === 'oracle') {
      writeOracle({
        address: CONTRACTS.ValuationOracle, abi: VALUATION_ORACLE_ABI,
        functionName: 'submitManualValuation', args: oracleArgs,
      });
      setOracleReady(false);
    }
  }, [oracleReady, oracleArgs, actionStep, writeOracle]);

  useEffect(() => {
    if (isOracleConfirmed && actionStep === 'oracle') { refetchOracleData(); refetchAsset(); onActionComplete(); }
  }, [isOracleConfirmed, actionStep, refetchOracleData, refetchAsset, onActionComplete]);

  useEffect(() => {
    if (hasOracleValuation && actionStep === 'oracle' && isOracleConfirmed) { setActionStep(null); setOracleArgs(null); }
  }, [hasOracleValuation, actionStep, isOracleConfirmed]);

  useEffect(() => {
    if (isMintConfirmed && actionStep === 'mint') { refetchNftOwner(); refetchAsset(); setActionStep('borrow'); onActionComplete(); }
  }, [isMintConfirmed, actionStep, refetchNftOwner, refetchAsset, onActionComplete]);

  useEffect(() => {
    if (isPoolConfirmed && actionStep === 'borrow') { setBorrowSuccess(true); setActionStep(null); setBorrowAmount(''); refetchAsset(); onActionComplete(); }
  }, [isPoolConfirmed, actionStep, refetchAsset, onActionComplete]);

  useEffect(() => {
    if (oracleError && actionStep === 'oracle') { setError('Değerleme hatası: ' + (oracleError?.message || 'İşlem reddedildi.')); setActionStep(null); }
  }, [oracleError, actionStep]);
  useEffect(() => {
    if (mintError && actionStep === 'mint') { setError('NFT mint hatası: ' + (mintError?.message || 'İşlem reddedildi.')); setActionStep(null); }
  }, [mintError, actionStep]);
  useEffect(() => {
    if (isMintReceiptError && actionStep === 'mint') { setError('NFT mint işlemi on-chain başarısız oldu.'); setActionStep(null); }
  }, [isMintReceiptError, actionStep]);
  useEffect(() => {
    if (poolError && actionStep === 'borrow') { setError('Kredi çekme hatası: ' + (poolError?.message || 'İşlem reddedildi.')); setActionStep(null); }
  }, [poolError, actionStep]);
  useEffect(() => {
    if (isPoolReceiptError && actionStep === 'borrow') { setError('Kredi çekme işlemi on-chain başarısız oldu.'); setActionStep(null); }
  }, [isPoolReceiptError, actionStep]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="skeleton h-10 w-10 rounded-xl" />
          <div className="space-y-2 flex-1">
            <div className="skeleton h-4 w-32 rounded-lg" />
            <div className="skeleton h-3 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!assetData) return null;

  const data = assetData as [bigint, bigint, bigint, string, bigint, bigint, bigint];
  const assetType = Number(data[1]);
  const status = Number(data[2]);
  const createdAt = Number(data[4]);
  const creditId = Number(data[6]);
  const date = new Date(createdAt * 1000).toLocaleDateString('tr-TR');
  const statusInfo = STATUS_MAP[status] || { label: 'Bilinmiyor', color: 'bg-gray-50 text-gray-600 border-gray-200', icon: '' };

  const handleValuation = async () => {
    setError(null); setActionStep('valuing');
    try {
      const isRealEstate = assetType === 0;
      const body = isRealEstate
        ? { city: 'Istanbul', district: 'Kadikoy', area: 100, propertyType: 'residence' }
        : { brand: 'Toyota', model: 'Corolla', year: 2022, km: 50000 };
      const response = await fetch('http://localhost:3001/api/valuation/' + (isRealEstate ? 'property' : 'vehicle'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n'); buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const d = JSON.parse(line.slice(6));
              if (d.data && d.progress === 100) {
                const scrapedValueUSD = d.data.estimatedValueUSD || d.data.estimatedValueTL || 0;
                const scrapedValueWei = BigInt(Math.round(scrapedValueUSD * 1e18));
                setOracleArgs([BigInt(assetId), scrapedValueWei, 'scraping']);
                setActionStep('oracle'); setOracleReady(true);
              }
            } catch(e) {}
          }
        }
      }
    } catch(e: any) { setError('Değerleme hatası: ' + e.message); setActionStep(null); }
  };

  const handleMint = () => {
    if (!address) return;
    setError(null); setActionStep('mint');
    writeMint({
      address: CONTRACTS.RWAToken, abi: RWA_TOKEN_ABI,
      functionName: 'mint',
      args: [address, BigInt(assetId), JSON.stringify({ assetId, type: assetType })],
    });
  };

  const handleBorrow = async () => {
    if (!borrowAmount) return;
    setError(null); setActionStep('borrow');
    try {
      const amountETH = parseFloat(borrowAmount) / 4000;
      const amountWei = BigInt(Math.round(amountETH * 1e18));
      writePool({
        address: CONTRACTS.CreditPool, abi: CREDIT_POOL_ABI,
        functionName: 'drawCredit', args: [BigInt(assetId), amountWei],
      });
    } catch (err: any) { setError(err?.message || 'Kredi çekme işlemi başlatılamadı'); setActionStep(null); }
  };

  const availableLiquidity = poolInfo ? Number(poolInfo[2]) / 1e18 : 0;
  const creditLimit = oracleValue ? Math.floor((oracleValue * 70) / 100) : 0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            assetType === 0 ? 'bg-blue-100' : 'bg-purple-100'
          }`}>
            <svg className={`w-6 h-6 ${assetType === 0 ? 'text-blue-600' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={TYPE_ICONS[assetType] || TYPE_ICONS[0]} />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-mono">#{assetId}</p>
            <p className="text-lg font-semibold text-gray-900">{TYPE_LABELS[assetType] || 'Bilinmiyor'}</p>
            <p className="text-xs text-gray-400 mt-0.5">{date}</p>
          </div>
        </div>
        <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusInfo.color}`}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={statusInfo.icon} />
          </svg>
          <span>{statusInfo.label}</span>
        </span>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        {oracleValue > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl flex-1">
            <span className="text-xs text-blue-600 font-medium">Değer</span>
            <p className="text-sm font-bold text-blue-800">{oracleValue.toLocaleString()} USD</p>
          </div>
        )}
        {creditLimit > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-xl flex-1">
            <span className="text-xs text-green-600 font-medium">Limit</span>
            <p className="text-sm font-bold text-green-800">{creditLimit.toLocaleString()} USD</p>
          </div>
        )}
      </div>

      {creditId > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 rounded-xl mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Kredi Aktif</p>
              {creditData && (
                <p className="text-xs text-green-600 mt-0.5">
                  {Number((creditData as [bigint, string, bigint, bigint, bigint, bigint, bigint, bigint, bigint, number])[3]) / 1e18} ETH çekildi
                </p>
              )}
            </div>
            <span className="text-xs text-green-600 font-mono">ID: {creditId}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-xl mb-4">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {borrowSuccess && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-xl mb-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-medium text-blue-800">Kredi başarıyla çekildi!</p>
          </div>
          <p className="text-xs text-blue-600">ETH cüzdanınıza aktarıldı.</p>
          <button onClick={() => setBorrowSuccess(false)} className="mt-2 text-xs text-blue-700 underline hover:no-underline">Tamam</button>
        </div>
      )}

      {status === 0 && !hasOracleValuation && actionStep !== 'valuing' && actionStep !== 'oracle' && (
        <button onClick={handleValuation} className="w-full gradient-primary text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition-all shadow-sm">
          Değerleme Yap
        </button>
      )}

      {actionStep === 'valuing' && (
        <div className="text-center py-4 bg-gray-50 rounded-xl">
          <div className="w-8 h-8 mx-auto mb-2 relative">
            <div className="w-8 h-8 border-4 border-gray-200 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" />
          </div>
          <p className="text-sm text-gray-600">Piyasa taranıyor...</p>
        </div>
      )}

      {actionStep === 'oracle' && (
        <div className="text-center py-4 bg-blue-50 rounded-xl">
          {isOraclePending ? (
            <>
              <div className="w-8 h-8 mx-auto mb-2 relative">
                <div className="w-8 h-8 border-4 border-gray-200 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" />
              </div>
              <p className="text-sm text-gray-600">Cüzdanınızda işlemi onaylayın...</p>
            </>
          ) : oracleHash && isOracleConfirming ? (
            <>
              <div className="w-8 h-8 mx-auto mb-2 relative">
                <div className="w-8 h-8 border-4 border-gray-200 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-green-500 rounded-full animate-spin" />
              </div>
              <p className="text-sm text-gray-600">Blockchain'e kaydediliyor...</p>
            </>
          ) : isOracleConfirmed ? (
            <p className="text-sm text-green-600 font-medium">Değerleme başarıyla kaydedildi!</p>
          ) : (
            <>
              <div className="w-8 h-8 mx-auto mb-2 relative">
                <div className="w-8 h-8 border-4 border-gray-200 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" />
              </div>
              <p className="text-sm text-gray-600">Blockchain'e kaydediliyor...</p>
            </>
          )}
        </div>
      )}

      {hasOracleValuation && creditId === 0 && actionStep !== 'mint' && actionStep !== 'borrow' && actionStep !== 'oracle' && !borrowSuccess && (
        <div className="space-y-2">
          {!isNftMinted ? (
            <>
              <button onClick={handleMint} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition-all shadow-sm">
                NFT Mintle
              </button>
              <p className="text-xs text-gray-500 text-center">Kredi çekmek için önce NFT mintleyin.</p>
            </>
          ) : (
            <>
              <button onClick={() => { setError(null); setActionStep('borrow'); }}
                className="w-full gradient-primary text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition-all shadow-sm">
                Kredi Çek
              </button>
              <p className="text-xs text-gray-500 text-center">
                Likidite yönetimi için <a href="/kredi-havuzu" className="text-blue-600 hover:underline">Kredi Havuzu</a> sayfasını kullanın.
              </p>
            </>
          )}
        </div>
      )}

      {actionStep === 'mint' && (
        <div className="text-center py-4 bg-green-50 rounded-xl">
          {isMintPending ? (
            <>
              <div className="w-8 h-8 mx-auto mb-2 relative">
                <div className="w-8 h-8 border-4 border-gray-200 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-green-500 rounded-full animate-spin" />
              </div>
              <p className="text-sm text-gray-600">Cüzdanınızda işlemi onaylayın...</p>
            </>
          ) : mintHash && isMintConfirming ? (
            <>
              <div className="w-8 h-8 mx-auto mb-2 relative">
                <div className="w-8 h-8 border-4 border-gray-200 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-green-500 rounded-full animate-spin" />
              </div>
              <p className="text-sm text-gray-600">Blockchain'e kaydediliyor...</p>
            </>
          ) : isMintConfirmed ? (
            <p className="text-sm text-green-600 font-medium">NFT başarıyla mintlendi! Kredi çekme adımına geçiliyor...</p>
          ) : (
            <>
              <div className="w-8 h-8 mx-auto mb-2 relative">
                <div className="w-8 h-8 border-4 border-gray-200 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-green-500 rounded-full animate-spin" />
              </div>
              <p className="text-sm text-gray-600">NFT mintleniyor...</p>
            </>
          )}
        </div>
      )}

      {hasOracleValuation && creditId === 0 && actionStep === 'borrow' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl">
              <p className="text-xs text-green-700">Limit</p>
              <p className="text-sm font-bold text-green-800">{creditLimit.toLocaleString()} USD</p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-xl">
              <p className="text-xs text-purple-700">Havuz</p>
              <p className="text-sm font-bold text-purple-800">{availableLiquidity.toFixed(3)} ETH</p>
            </div>
          </div>
          {availableLiquidity <= 0 && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
              <p className="text-sm text-amber-700">Havuzda yeterli likidite bulunmuyor.</p>
            </div>
          )}
          {isPoolPending || isPoolConfirming ? (
            <div className="text-center py-4 bg-blue-50 rounded-xl">
              <div className="w-8 h-8 mx-auto mb-2 relative">
                <div className="w-8 h-8 border-4 border-gray-200 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" />
              </div>
              <p className="text-sm text-gray-600">{isPoolPending ? 'Cüzdanınızda işlemi onaylayın...' : "Blockchain'e kaydediliyor..."}</p>
            </div>
          ) : (
            <>
              <div>
                <div className="flex space-x-2">
                  <input type="number" value={borrowAmount} onChange={(e) => setBorrowAmount(e.target.value)}
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Miktar (USD)" />
                  <button onClick={() => setBorrowAmount(String(creditLimit))}
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">
                    Max
                  </button>
                  <button onClick={handleBorrow} disabled={!borrowAmount || parseFloat(borrowAmount) < 40 || isPoolPending}
                    className="gradient-primary text-white px-5 py-2.5 rounded-xl font-medium disabled:opacity-50 hover:opacity-90 transition-all shadow-sm">
                    Çek
                  </button>
                </div>
                {borrowAmount && (
                  <p className="text-xs text-gray-500 mt-2">≈ {(parseFloat(borrowAmount) / 4000).toFixed(6)} ETH</p>
                )}
                {borrowAmount && parseFloat(borrowAmount) < 40 && (
                  <p className="text-xs text-red-500 mt-1">Minimum 40 USD</p>
                )}
              </div>
              <button onClick={() => { setActionStep(null); setBorrowAmount(''); }}
                className="w-full bg-gray-100 text-gray-600 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">
                İptal
              </button>
            </>
          )}
        </div>
      )}

      {creditId > 0 && (
        <div className="text-center py-2">
          <p className="text-sm text-green-600 font-medium">Kredi aktif</p>
          {creditData && (
            <p className="text-xs text-green-500">{Number((creditData as [bigint, string, bigint, bigint, bigint, bigint, bigint, bigint, bigint, number])[3]) / 1e18} ETH çekildi</p>
          )}
        </div>
      )}
    </div>
  );
}
