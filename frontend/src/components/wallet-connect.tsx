'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export function WalletConnect() {
  return (
    <div className="flex items-center">
      <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
    </div>
  );
}
