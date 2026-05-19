'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '@/lib/constants';

const CREDIT_POOL_ABI = [
  { name: 'depositLiquidity', type: 'function', stateMutability: 'payable', inputs: [], outputs: [] },
  { name: 'withdrawLiquidity', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'amount', type: 'uint256' }], outputs: [] },
  { name: 'getPoolInfo', type: 'function', stateMutability: 'view', inputs: [], outputs: [
    { name: 'totalLiquidity', type: 'uint256' }, { name: 'totalBorrowed', type: 'uint256' },
    { name: 'availableLiquidity', type: 'uint256' }, { name: 'utilizationRate', type: 'uint256' },
    { name: 'annualInterestRate', type: 'uint256' }
  ] },
  { name: 'liquidityProviders', type: 'function', stateMutability: 'view', inputs: [{ name: 'provider', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'getUserCredits', type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ type: 'uint256[]' }] },
  { name: 'getCredit', type: 'function', stateMutability: 'view', inputs: [{ name: 'creditId', type: 'uint256' }], outputs: [
    { name: 'id', type: 'uint256' }, { name: 'borrower', type: 'address' },
    { name: 'assetId', type: 'uint256' }, { name: 'principal', type: 'uint256' },
    { name: 'interest', type: 'uint256' }, { name: 'totalRepayment', type: 'uint256' },
    { name: 'amountRepaid', type: 'uint256' }, { name: 'startTime', type: 'uint256' },
    { name: 'dueDate', type: 'uint256' }, { name: 'status', type: 'uint8' }
  ] },
  { name: 'repayCredit', type: 'function', stateMutability: 'payable', inputs: [{ name: 'creditId', type: 'uint256' }], outputs: [] },
];

function StatCard({ label, value, sub, icon, color }: { label: string; value: string; sub?: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className={`mt-1.5 text-2xl font-bold ${color}`}>{value}</p>
          {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-opacity-10`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function CreditCard({ creditId, onRepaySuccess }: { creditId: bigint; onRepaySuccess: () => void }) {
  const { data: creditData } = useReadContract({
    address: CONTRACTS.CreditPool as `0x${string}`,
    abi: CREDIT_POOL_ABI,
    functionName: 'getCredit',
    args: [BigInt(creditId)],
  });

  const [repayAmount, setRepayAmount] = useState('');
  const { writeContract: writeRepay, data: repayHash, isPending: isRepayPending, error: repayError } = useWriteContract();
  const { isSuccess: isRepayConfirmed, isLoading: isRepayConfirming } = useWaitForTransactionReceipt({ hash: repayHash });

  useEffect(() => {
    if (isRepayConfirmed) { setRepayAmount(''); onRepaySuccess(); }
  }, [isRepayConfirmed, onRepaySuccess]);

  if (!creditData) return null;

  const data = creditData as [bigint, string, bigint, bigint, bigint, bigint, bigint, bigint, bigint, number];
  const assetId = Number(data[2]);
  const principal = Number(data[3]) / 1e18;
  const totalRepayment = Number(data[5]) / 1e18;
  const status = data[9];
  const statusLabels = ['Aktif', 'Ödendi', 'Temerrüt', 'Tasfiye'];
  const statusColors = ['bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-red-100 text-red-700', 'bg-gray-100 text-gray-700'];
  const progress = totalRepayment > 0 ? (Number(data[6]) / 1e18 / totalRepayment) * 100 : 0;

  const handleRepay = () => {
    if (!repayAmount) return;
    writeRepay({
      address: CONTRACTS.CreditPool, abi: CREDIT_POOL_ABI,
      functionName: 'repayCredit', args: [BigInt(creditId)],
      value: BigInt(Math.round(parseFloat(repayAmount) * 1e18)),
    });
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 card-hover">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
            {Number(creditId)}
          </div>
          <div>
            <p className="text-sm text-gray-500">Kredi #{Number(creditId)}</p>
            <p className="font-medium text-gray-900">Varlık #{assetId}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>
          {statusLabels[status] || 'Bilinmiyor'}
        </span>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Geri ödeme ilerlemesi</span>
          <span className="text-sm font-medium text-gray-900">%{progress.toFixed(0)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500" style={{ width: Math.min(progress, 100) + '%' }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-xs text-gray-500">Anapara</p>
          <p className="text-sm font-semibold text-gray-900">{principal.toFixed(4)} ETH</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Toplam</p>
          <p className="text-sm font-semibold text-gray-900">{totalRepayment.toFixed(4)} ETH</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Kalan</p>
          <p className="text-sm font-semibold text-gray-900">{(totalRepayment - Number(data[6]) / 1e18).toFixed(4)} ETH</p>
        </div>
      </div>

      {status === 0 && (
        <div className="border-t border-gray-100 pt-4">
          <div className="flex space-x-2">
            <input type="number" value={repayAmount} onChange={(e) => setRepayAmount(e.target.value)}
              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="ETH miktarı" step="0.01" />
            <button onClick={handleRepay} disabled={isRepayPending}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all shadow-sm">
              {isRepayPending ? 'Onay...' : isRepayConfirming ? 'Kaydediliyor...' : isRepayConfirmed ? '\u2713 Ödendi' : 'Öde'}
            </button>
          </div>
          {repayError && <p className="text-xs text-red-600 mt-2">{repayError.message}</p>}
          {repayHash && <p className="text-xs text-gray-400 mt-2 break-all font-mono">Tx: {repayHash}</p>}
        </div>
      )}
    </div>
  );
}

export default function KrediHavuzuPage() {
  const { isConnected, address } = useAccount();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const { data: poolInfo, refetch: refetchPoolInfo } = useReadContract({
    address: CONTRACTS.CreditPool as `0x${string}`,
    abi: CREDIT_POOL_ABI,
    functionName: 'getPoolInfo',
  }) as { data: [bigint, bigint, bigint, bigint, bigint] | undefined; refetch: () => void };

  const { data: userLiquidity, refetch: refetchUserLiquidity } = useReadContract({
    address: CONTRACTS.CreditPool as `0x${string}`,
    abi: CREDIT_POOL_ABI,
    functionName: 'liquidityProviders',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  }) as { data: bigint | undefined; refetch: () => void };

  const { data: userCreditIds, refetch: refetchUserCredits } = useReadContract({
    address: CONTRACTS.CreditPool as `0x${string}`,
    abi: CREDIT_POOL_ABI,
    functionName: 'getUserCredits',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  }) as { data: bigint[] | undefined; refetch: () => void };

  const { writeContract: writeDeposit, data: depositHash, isPending: isDepositPending, error: depositError } = useWriteContract();
  const { writeContract: writeWithdraw, data: withdrawHash, isPending: isWithdrawPending, error: withdrawError } = useWriteContract();

  const { isSuccess: isDepositConfirmed, isLoading: isDepositConfirming } = useWaitForTransactionReceipt({ hash: depositHash });
  const { isSuccess: isWithdrawConfirmed, isLoading: isWithdrawConfirming } = useWaitForTransactionReceipt({ hash: withdrawHash });

  useEffect(() => {
    if (isDepositConfirmed || isWithdrawConfirmed) { refetchPoolInfo(); refetchUserLiquidity(); refetchUserCredits(); }
  }, [isDepositConfirmed, isWithdrawConfirmed]);

  useEffect(() => { if (isDepositConfirmed) setDepositAmount(''); }, [isDepositConfirmed]);
  useEffect(() => { if (isWithdrawConfirmed) setWithdrawAmount(''); }, [isWithdrawConfirmed]);

  const handleDeposit = () => {
    if (!depositAmount) return;
    writeDeposit({
      address: CONTRACTS.CreditPool, abi: CREDIT_POOL_ABI,
      functionName: 'depositLiquidity',
      value: BigInt(Math.round(parseFloat(depositAmount) * 1e18)),
    });
  };

  const handleWithdraw = () => {
    if (!withdrawAmount) return;
    writeWithdraw({
      address: CONTRACTS.CreditPool, abi: CREDIT_POOL_ABI,
      functionName: 'withdrawLiquidity',
      args: [BigInt(Math.round(parseFloat(withdrawAmount) * 1e18))],
    });
  };

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
          <p className="text-sm text-gray-500">Kredi havuzuna erişmek için cüzdanınızı bağlayın.</p>
        </div>
      </div>
    );
  }

  const totalLiq = poolInfo ? Number((poolInfo as any)[0]) / 1e18 : 0;
  const totalBorrowed = poolInfo ? Number((poolInfo as any)[1]) / 1e18 : 0;
  const available = poolInfo ? Number((poolInfo as any)[2]) / 1e18 : 0;
  const rate = poolInfo ? Number((poolInfo as any)[4]) / 100 : 0;
  const utilization = totalLiq > 0 ? (totalBorrowed / totalLiq * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-gray-900">Kredi Havuzu</h1>
        <p className="text-gray-500 mt-1">Likidite sağlayın veya varlıklarınıza karşılık kredi çekin</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
        <StatCard label="Toplam Likidite" value={`${totalLiq.toFixed(4)} ETH`}
          color="text-blue-600"
          icon={<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
        <StatCard label="Kullanılan" value={`${totalBorrowed.toFixed(4)} ETH`}
          color="text-red-600"
          icon={<svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard label="Kullanılabilir" value={`${available.toFixed(4)} ETH`} sub={`Kullanım: %${utilization.toFixed(1)}`}
          color="text-green-600"
          icon={<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard label="Faiz Oranı" value={`%${rate}`}
          color="text-purple-600"
          icon={<svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-8 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-2 rounded-full transition-all duration-500" style={{ width: Math.min(utilization, 100) + '%' }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-slide-up">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Likidite Yatır</h2>
          </div>
          <div className="flex space-x-2">
            <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)}
              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="ETH miktarı" step="0.01" />
            <button onClick={handleDeposit} disabled={isDepositPending}
              className="gradient-primary text-white px-6 py-2.5 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-all shadow-sm">
              {isDepositPending ? 'Onay...' : isDepositConfirming ? 'Kaydediliyor...' : isDepositConfirmed ? '\u2713 Tamam' : 'Yatır'}
            </button>
          </div>
          {depositError && <p className="text-sm text-red-600 mt-2">{depositError.message}</p>}
          {depositHash && <p className="text-xs text-gray-400 mt-2 break-all font-mono">Tx: {depositHash}</p>}
          {isDepositConfirmed && (
            <div className="flex items-center space-x-2 mt-3 text-sm text-green-600 bg-green-50 p-2 rounded-xl">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              <span className="font-medium">Likidite yatırıldı!</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Likidite Çek</h2>
          </div>
          <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-xl mb-4">
            <span className="text-sm text-gray-600">Yatırdığınız</span>
            <span className="text-sm font-bold text-gray-900">{userLiquidity ? (Number(userLiquidity) / 1e18).toFixed(4) : '0'} ETH</span>
          </div>
          <div className="flex space-x-2">
            <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)}
              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="ETH miktarı" step="0.01" />
            <button onClick={() => setWithdrawAmount(userLiquidity ? (Number(userLiquidity) / 1e18).toString() : '0')}
              disabled={!userLiquidity || Number(userLiquidity) === 0}
              className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 disabled:opacity-40 transition-all">
              Max
            </button>
            <button onClick={handleWithdraw} disabled={isWithdrawPending || !withdrawAmount}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2.5 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-all shadow-sm">
              {isWithdrawPending ? 'Onay...' : isWithdrawConfirming ? 'Kaydediliyor...' : isWithdrawConfirmed ? '\u2713 \u00c7ekildi' : '\u00c7ek'}
            </button>
          </div>
          {withdrawError && <p className="text-sm text-red-600 mt-2">{withdrawError.message}</p>}
          {withdrawHash && <p className="text-xs text-gray-400 mt-2 break-all font-mono">Tx: {withdrawHash}</p>}
          {isWithdrawConfirmed && (
            <div className="flex items-center space-x-2 mt-3 text-sm text-green-600 bg-green-50 p-2 rounded-xl">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              <span className="font-medium">Likidite çekildi!</span>
            </div>
          )}
        </div>
      </div>

      {(() => {
        const credits = userCreditIds as bigint[] | undefined;
        if (!credits || !Array.isArray(credits) || credits.length === 0) return null;
        return (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-slide-up">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Kredilerim</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {credits.map((id: bigint) => (
                <CreditCard key={Number(id)} creditId={id}
                  onRepaySuccess={() => { refetchPoolInfo(); refetchUserCredits(); }} />
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
