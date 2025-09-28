'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';
import { WalletConnect } from './wallet-connect';
import { useEffect, useState } from 'react';

function NavigationContent() {
  const pathname = usePathname();
  const { isConnected, address } = useAccount();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: '/attest', label: 'Claim Skills' },
    { href: '/claims', label: 'View Claims' },
    { href: '/recruit', label: 'Recruit' },
    { href: '/admin', label: 'Owner' },
    { href: '/challenges', label: 'Challenges' },
    { href: '/resolve', label: 'Resolve' },
    { href: '/profile', label: 'Profile' },
    { href: '/test', label: 'Test' },
    { href: '/test-contract', label: 'Test Contract' },
  ];

  return (
    <nav className="bg-white shadow-md border-b border-gray-100 font-sans ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <Image src="/logo.png" alt="Crucible Logo" width={40} height={40} className="rounded-lg shadow-md" />
              <span className="text-2xl font-light text-gray-800 pr-10">Crucible </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-base font-normal transition-colors ${
                    isActive(item.href)
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500'
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4 p-2 rounded-2xl shadow-inner bg-gray-50">
            <WalletConnect />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-normal transition-colors ${
                  isActive(item.href)
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

export function Navigation() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering Web3 components on server
  if (!mounted) {
    return (
      <nav className="bg-white shadow-md border-b border-gray-100 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <Image src="/logo.png" alt="Crucible Logo" width={40} height={40} className="rounded-lg shadow-md" />
                <span className="text-2xl font-light text-gray-800 pr-10">Crucible</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4 p-2 rounded-2xl shadow-inner bg-gray-50">
              <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return <NavigationContent />;
}
