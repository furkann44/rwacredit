'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/varliklarim', label: 'Varlıklarım' },
  { href: '/varlik-ekle', label: 'Varlık Ekle' },
  { href: '/kredi-havuzu', label: 'Kredi Havuzu' },
  { href: '/p2p-pazar', label: 'P2P Pazar' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold gradient-text tracking-tight">
              RWACredit
            </Link>
            <nav className="hidden md:flex items-center space-x-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center space-x-3">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}
