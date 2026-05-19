'use client';

import { useAccount } from 'wagmi';

export default function P2PPazarPage() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return <div className='text-center py-12 text-gray-600'>Cüzdanınızı bağlayın</div>;
  }

  return (
    <div className='max-w-4xl mx-auto'>
      <h1 className='text-2xl font-bold text-gray-900 mb-6'>P2P Kredi Pazarı</h1>
      <div className='bg-white p-6 rounded-lg shadow'>
        <p className='text-gray-700'>Aktif kredi teklifi yok.</p>
        <p className='text-sm text-gray-500 mt-2'>Başlamak için bir borçlanma teklifi oluşturun.</p>
      </div>
    </div>
  );
}
