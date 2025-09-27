'use client';

import { useAccount, useChainId } from 'wagmi';
import { useSkillClaims, useAvailableSkills } from '@/hooks/useSkillVerification';

export function DebugInfo() {
  const { address, isConnected, chain } = useAccount();
  const chainId = useChainId();
  const { data: skillClaims, isLoading: claimsLoading, error: claimsError } = useSkillClaims();
  const { data: availableSkills, isLoading: skillsLoading, error: skillsError } = useAvailableSkills();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
        <div>Address: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'None'}</div>
        <div>Chain: {chain?.name || 'Unknown'} ({chainId})</div>
        <div>Contract: 0x09aB...eAD5</div>
        <div>Claims: {claimsLoading ? 'Loading...' : claimsError ? 'Error' : skillClaims?.length || 0}</div>
        <div>Skills: {skillsLoading ? 'Loading...' : skillsError ? 'Error' : availableSkills?.length || 0}</div>
        {claimsError && <div className="text-red-400">Claims Error: {claimsError.message}</div>}
        {skillsError && <div className="text-red-400">Skills Error: {skillsError.message}</div>}
        <div className="text-yellow-400 mt-2">
          Note: Contract needs skills added by owner
        </div>
      </div>
    </div>
  );
}