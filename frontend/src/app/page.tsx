'use client';

import { useAccount, useReadContract } from 'wagmi';
import Link from 'next/link';
import { CONTRACTS } from '@/lib/constants';

const RWA_REGISTRY_ABI = [
  { name: 'getAssetCounter', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
];

const CREDIT_POOL_ABI = [
  { name: 'getPoolInfo', type: 'function', stateMutability: 'view', inputs: [], outputs: [
    { name: 'totalLiquidity', type: 'uint256' }, { name: 'totalBorrowed', type: 'uint256' },
    { name: 'availableLiquidity', type: 'uint256' }, { name: 'utilizationRate', type: 'uint256' },
    { name: 'annualInterestRate', type: 'uint256' }
  ] },
];

function StatCard({ label, value, sub, icon, color }: { label: string; value: string; sub?: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function ActionCard({ href, title, desc, gradient, icon }: { href: string; title: string; desc: string; gradient: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-2xl p-6 ${gradient} text-white card-hover`}
    >
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-white/80">{desc}</p>
      </div>
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

export default function Home() {
  const { isConnected } = useAccount();

  const { data: assetCounter } = useReadContract({
    address: CONTRACTS.RWARegistry as `0x${string}`,
    abi: RWA_REGISTRY_ABI,
    functionName: 'getAssetCounter',
    query: { refetchInterval: 10000 },
  });

  const { data: poolInfo } = useReadContract({
    address: CONTRACTS.CreditPool as `0x${string}`,
    abi: CREDIT_POOL_ABI,
    functionName: 'getPoolInfo',
    query: { refetchInterval: 10000 },
  }) as { data: [bigint, bigint, bigint, bigint, bigint] | undefined };

  const totalAssets = assetCounter ? Number(assetCounter) : 0;
  const totalBorrowed = poolInfo ? Number(poolInfo[1]) / 1e18 : 0;
  const totalLiquidity = poolInfo ? Number(poolInfo[0]) / 1e18 : 0;
  const availableLiquidity = poolInfo ? Number(poolInfo[2]) / 1e18 : 0;
  const utilization = totalLiquidity > 0 ? (totalBorrowed / totalLiquidity * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="text-center py-12 animate-slide-up">
        <div className="inline-flex items-center px-3 py-1 bg-blue-50 rounded-full text-sm font-medium text-blue-700 mb-6">
          Gerçek Dünya Varlık Destekli Kredi Platformu
        </div>
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
          <span className="gradient-text">RWACredit</span>
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
          Gayrimenkul ve araçlarınızı tokenize edin, anında krediye dönüştürün.
        </p>
        {!isConnected && (
          <div className="mt-8">
            <p className="text-sm text-gray-400">Devam etmek için cüzdanınızı bağlayın</p>
          </div>
        )}
      </div>

      {isConnected && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
            <StatCard
              label="Toplam Varlık"
              value={String(totalAssets)}
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
              color="bg-blue-600"
            />
            <StatCard
              label="Aktif Krediler"
              value={`${totalBorrowed.toFixed(4)} ETH`}
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="bg-green-600"
            />
            <StatCard
              label="Havuz Likiditesi"
              value={`${totalLiquidity.toFixed(4)} ETH`}
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
              color="bg-purple-600"
            />
            <StatCard
              label="Kullanılabilir"
              value={`${availableLiquidity.toFixed(4)} ETH`}
              sub={`Kullanım: %${utilization.toFixed(1)}`}
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              color="bg-amber-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
            <ActionCard
              href="/varlik-ekle"
              title="Varlık Ekle"
              desc="Gayrimenkul veya araç kaydedin, anlık değerleme alın"
              gradient="gradient-primary"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
            />
            <ActionCard
              href="/kredi-havuzu"
              title="Kredi Havuzu"
              desc="Likidite ekleyin veya varlıklarınıza karşılık kredi çekin"
              gradient="linear-gradient(135deg, #7c3aed, #db2777)"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-8 animate-slide-up">
            {[
              { label: 'Varlıklarım', href: '/varliklarim', desc: 'Kayıtlı varlıklarınızı görüntüleyin', color: 'border-blue-200 hover:bg-blue-50', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
              { label: 'P2P Pazar', href: '/p2p-pazar', desc: 'Peer-to-peer kredi alışverişi', color: 'border-purple-200 hover:bg-purple-50', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
              { label: 'Tüm İşlemler', href: '/kredi-havuzu', desc: 'Kredi geçmişi ve durumu', color: 'border-green-200 hover:bg-green-50', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`bg-white rounded-xl p-5 border-2 ${item.color} transition-all duration-200 card-hover`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
