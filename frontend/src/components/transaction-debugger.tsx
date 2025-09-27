'use client';

import { useAccount, useChainId, useBalance } from 'wagmi';
import { useSkillClaims, useAvailableSkills } from '@/hooks/useSkillVerification';
import { SKILL_VERIFICATION_ADDRESS } from '@/lib/contracts';

export function TransactionDebugger() {
  const { address, isConnected, chain } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address });
  const { data: skillClaims, error: claimsError } = useSkillClaims();
  const { data: availableSkills, error: skillsError } = useAvailableSkills();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const commonIssues = [
    {
      issue: "Insufficient Balance",
      check: balance ? Number(balance.value) < 1000000000000000 : false, // Less than 0.001 ETH
      solution: "You need FLOW tokens to pay for gas fees. Get testnet FLOW from a faucet."
    },
    {
      issue: "Wrong Network",
      check: chainId !== 545,
      solution: "Switch to Flow Testnet (Chain ID: 545)"
    },
    {
      issue: "Contract Not Deployed",
      check: claimsError?.message?.includes('0x0000000000000000000000000000000000000000'),
      solution: "Contract address is zero. Check deployment."
    },
    {
      issue: "RPC Connection",
      check: claimsError?.message?.includes('fetch') || skillsError?.message?.includes('fetch'),
      solution: "RPC endpoint issue. Check network connectivity."
    },
    {
      issue: "Function Not Found",
      check: claimsError?.message?.includes('function') || skillsError?.message?.includes('function'),
      solution: "ABI mismatch. Check contract functions."
    }
  ];

  const activeIssues = commonIssues.filter(issue => issue.check);

  return (
    <div className="fixed top-4 left-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2 text-red-400">Transaction Debugger</h3>
      
      <div className="space-y-1 mb-3">
        <div>Connected: {isConnected ? '✅' : '❌'}</div>
        <div>Address: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'None'}</div>
        <div>Chain: {chain?.name || 'Unknown'} ({chainId})</div>
        <div>Balance: {balance ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}` : 'Loading...'}</div>
        <div>Contract: {SKILL_VERIFICATION_ADDRESS.slice(0, 6)}...{SKILL_VERIFICATION_ADDRESS.slice(-4)}</div>
      </div>

      {activeIssues.length > 0 && (
        <div className="border-t border-red-500 pt-2">
          <div className="text-red-400 font-semibold mb-1">Issues Found:</div>
          {activeIssues.map((issue, index) => (
            <div key={index} className="mb-2">
              <div className="text-red-300">• {issue.issue}</div>
              <div className="text-yellow-300 text-xs ml-2">{issue.solution}</div>
            </div>
          ))}
        </div>
      )}

      {claimsError && (
        <div className="border-t border-red-500 pt-2">
          <div className="text-red-400 font-semibold">Claims Error:</div>
          <div className="text-red-300 text-xs break-all">{claimsError.message}</div>
        </div>
      )}

      {skillsError && (
        <div className="border-t border-red-500 pt-2">
          <div className="text-red-400 font-semibold">Skills Error:</div>
          <div className="text-red-300 text-xs break-all">{skillsError.message}</div>
        </div>
      )}

      <div className="border-t border-gray-600 pt-2 mt-2">
        <div className="text-gray-400 text-xs">
          <div>Skills: {availableSkills?.length || 0}</div>
          <div>Claims: {skillClaims?.length || 0}</div>
        </div>
      </div>
    </div>
  );
}