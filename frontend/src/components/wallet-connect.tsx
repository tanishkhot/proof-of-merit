'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEffect, useState } from 'react';

export function WalletConnect() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering on server
  if (!mounted) {
    return (
      <div className="flex items-center">
        <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
    </div>
  );
}
