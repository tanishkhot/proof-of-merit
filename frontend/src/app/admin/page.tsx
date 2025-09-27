'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { 
  useAvailableSkills, 
  useAddSkill, 
  useRemoveSkill, 
  useUpdateProblemStatement,
  useAddMultipleSkills,
  useDirectlyAssignSkill,
  useDirectlyAssignMultipleSkills,
  useResolveChallenge,
  useEmergencyWithdraw,
  useSetResolver,
  useTransactionStatus,
  useSkillClaims,
  useAllChallenges
} from '@/hooks/useSkillVerification';
import { WalletConnect } from '@/components/wallet-connect';

const AdminPage = () => {
  const { isConnected, address } = useAccount();
  const { data: availableSkills, isLoading: skillsLoading } = useAvailableSkills();
  const { data: skillClaims } = useSkillClaims();
  const { data: challenges } = useAllChallenges();

  // State for different forms
  const [newSkill, setNewSkill] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [newProblemStatement, setNewProblemStatement] = useState('');
  const [newResolver, setNewResolver] = useState('');
  const [directUser, setDirectUser] = useState('');
  const [directSkill, setDirectSkill] = useState('');
  const [resolveClaimId, setResolveClaimId] = useState('');

  // Hooks for contract interactions
  const { addSkill, hash: addSkillHash, error: addSkillError, isPending: isAddSkillPending } = useAddSkill();
  const { removeSkill, hash: removeSkillHash, error: removeSkillError, isPending: isRemoveSkillPending } = useRemoveSkill();
  const { updateProblemStatement, hash: updateHash, error: updateError, isPending: isUpdatePending } = useUpdateProblemStatement();
  const { setResolver, hash: setResolverHash, error: setResolverError, isPending: isSetResolverPending } = useSetResolver();
  const { directlyAssignSkill, hash: directAssignHash, error: directAssignError, isPending: isDirectAssignPending } = useDirectlyAssignSkill();
  const { resolveChallenge, hash: resolveHash, error: resolveError, isPending: isResolvePending } = useResolveChallenge();
  const { emergencyWithdraw, hash: withdrawHash, error: withdrawError, isPending: isWithdrawPending } = useEmergencyWithdraw();

  // Transaction status hooks
  const { isLoading: isAddSkillConfirming, isSuccess: isAddSkillSuccess } = useTransactionStatus(addSkillHash);
  const { isLoading: isRemoveSkillConfirming, isSuccess: isRemoveSkillSuccess } = useTransactionStatus(removeSkillHash);
  const { isLoading: isUpdateConfirming, isSuccess: isUpdateSuccess } = useTransactionStatus(updateHash);
  const { isLoading: isSetResolverConfirming, isSuccess: isSetResolverSuccess } = useTransactionStatus(setResolverHash);
  const { isLoading: isDirectAssignConfirming, isSuccess: isDirectAssignSuccess } = useTransactionStatus(directAssignHash);
  const { isLoading: isResolveConfirming, isSuccess: isResolveSuccess } = useTransactionStatus(resolveHash);
  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawSuccess } = useTransactionStatus(withdrawHash);

  const isOwner = true; // This should be checked against the contract owner

  const handleAddSkill = async () => {
    if (!newSkill.trim() || !problemStatement.trim()) return;
    try {
      await addSkill(newSkill, problemStatement);
      setNewSkill('');
      setProblemStatement('');
    } catch (err) {
      console.error('Error adding skill:', err);
    }
  };

  const handleRemoveSkill = async () => {
    if (!selectedSkill) return;
    try {
      await removeSkill(selectedSkill);
      setSelectedSkill('');
    } catch (err) {
      console.error('Error removing skill:', err);
    }
  };

  const handleUpdateProblemStatement = async () => {
    if (!selectedSkill || !newProblemStatement.trim()) return;
    try {
      await updateProblemStatement(selectedSkill, newProblemStatement);
      setNewProblemStatement('');
    } catch (err) {
      console.error('Error updating problem statement:', err);
    }
  };

  const handleSetResolver = async () => {
    if (!newResolver.trim()) return;
    try {
      await setResolver(newResolver);
      setNewResolver('');
    } catch (err) {
      console.error('Error setting resolver:', err);
    }
  };

  const handleDirectAssignSkill = async () => {
    if (!directUser.trim() || !directSkill.trim()) return;
    try {
      await directlyAssignSkill(directUser, directSkill);
      setDirectUser('');
      setDirectSkill('');
      // Show success message
      alert(`Skill "${directSkill}" has been directly assigned to ${directUser}`);
    } catch (err) {
      console.error('Error directly assigning skill:', err);
    }
  };

  const handleResolveChallenge = async () => {
    if (!resolveClaimId.trim()) return;
    try {
      await resolveChallenge(parseInt(resolveClaimId));
      setResolveClaimId('');
    } catch (err) {
      console.error('Error resolving challenge:', err);
    }
  };

  const handleEmergencyWithdraw = async () => {
    try {
      await emergencyWithdraw();
    } catch (err) {
      console.error('Error emergency withdrawing:', err);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-white text-gray-800 p-8 font-sans flex flex-col justify-center items-center">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-light mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Connect Your Wallet</h1>
          <p className="text-xl text-gray-600 font-light mb-8">
            Please connect your wallet to access admin functions.
          </p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-white text-gray-800 p-8 font-sans flex flex-col justify-center items-center">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-light mb-4 text-red-500">Access Denied</h1>
          <p className="text-xl text-gray-600 font-light mb-8">
            Only the contract owner can access admin functions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Owner Dashboard</h1>
          <WalletConnect />
        </div>

        {/* Success & Error Messages */}
        {isAddSkillSuccess && <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-xl mb-4">Skill added successfully!</div>}
        {isRemoveSkillSuccess && <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-xl mb-4">Skill removed successfully!</div>}
        {isUpdateSuccess && <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-xl mb-4">Problem statement updated successfully!</div>}
        {isSetResolverSuccess && <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-xl mb-4">Resolver updated successfully!</div>}
        {isDirectAssignSuccess && <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-xl mb-4">Skill directly assigned successfully!</div>}
        {isResolveSuccess && <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-xl mb-4">Challenge resolved successfully!</div>}
        {isWithdrawSuccess && <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-xl mb-4">Emergency withdrawal successful!</div>}
        {(addSkillError || removeSkillError || updateError || setResolverError || directAssignError || resolveError || withdrawError) && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-4">
            Error: {(addSkillError || removeSkillError || updateError || setResolverError || directAssignError || resolveError || withdrawError)?.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-2xl font-light text-gray-800 mb-4">Available Skills</h3>
              {skillsLoading ? <p className="text-gray-500">Loading skills...</p> : availableSkills && availableSkills.length > 0 ? (
                <div className="space-y-3">
                  {availableSkills.map((skill: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="font-medium text-gray-800">{skill}</span>
                      <span className="text-sm font-medium text-green-500">Available</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-500">No skills available yet</p>}
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-2xl font-light text-gray-800 mb-4">Add New Skill</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="skill-name" className="block text-base font-medium text-gray-700 mb-2">Skill Name</label>
                  <input id="skill-name" type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" placeholder="e.g., React, Solidity" />
                </div>
                <div>
                  <label htmlFor="problem-statement" className="block text-base font-medium text-gray-700 mb-2">Problem Statement</label>
                  <textarea id="problem-statement" value={problemStatement} onChange={(e) => setProblemStatement(e.target.value)} rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" placeholder="Describe the problem..." />
                </div>
                <button onClick={handleAddSkill} disabled={!newSkill.trim() || !problemStatement.trim() || isAddSkillPending || isAddSkillConfirming} className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-normal py-3 px-8 rounded-xl shadow-md transition-all duration-300">
                  {isAddSkillPending ? 'Confirming...' : isAddSkillConfirming ? 'Processing...' : 'Add Skill'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-2xl font-light text-gray-800 mb-4">Remove Skill</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="remove-skill" className="block text-base font-medium text-gray-700 mb-2">Select Skill to Remove</label>
                  <select id="remove-skill" value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500">
                    <option value="">Select a skill...</option>
                    {availableSkills?.map((skill: string) => <option key={skill} value={skill}>{skill}</option>)}
                  </select>
                </div>
                <button onClick={handleRemoveSkill} disabled={!selectedSkill || isRemoveSkillPending || isRemoveSkillConfirming} className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-normal py-3 px-8 rounded-xl shadow-md transition-all duration-300">
                  {isRemoveSkillPending ? 'Confirming...' : isRemoveSkillConfirming ? 'Processing...' : 'Remove Skill'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-2xl font-light text-gray-800 mb-4">Update Problem Statement</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="update-skill" className="block text-base font-medium text-gray-700 mb-2">Select Skill</label>
                  <select id="update-skill" value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500">
                    <option value="">Select a skill...</option>
                    {availableSkills?.map((skill: string) => <option key={skill} value={skill}>{skill}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="new-problem" className="block text-base font-medium text-gray-700 mb-2">New Problem Statement</label>
                  <textarea id="new-problem" value={newProblemStatement} onChange={(e) => setNewProblemStatement(e.target.value)} rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" placeholder="Enter the new problem statement..." />
                </div>
                <button onClick={handleUpdateProblemStatement} disabled={!selectedSkill || !newProblemStatement.trim() || isUpdatePending || isUpdateConfirming} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-normal py-3 px-8 rounded-xl shadow-md transition-all duration-300">
                  {isUpdatePending ? 'Confirming...' : isUpdateConfirming ? 'Processing...' : 'Update Problem Statement'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-2xl font-light text-gray-800 mb-4">Set Resolver</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="resolver-address" className="block text-base font-medium text-gray-700 mb-2">New Resolver Address</label>
                  <input id="resolver-address" type="text" value={newResolver} onChange={(e) => setNewResolver(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" placeholder="0x..." />
                </div>
                <button onClick={handleSetResolver} disabled={!newResolver.trim() || isSetResolverPending || isSetResolverConfirming} className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-normal py-3 px-8 rounded-xl shadow-md transition-all duration-300">
                  {isSetResolverPending ? 'Confirming...' : isSetResolverConfirming ? 'Processing...' : 'Set Resolver'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-2xl font-light text-gray-800 mb-4">Directly Assign Skill</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="direct-user" className="block text-base font-medium text-gray-700 mb-2">User Address</label>
                  <input id="direct-user" type="text" value={directUser} onChange={(e) => setDirectUser(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" placeholder="0x..." />
                </div>
                <div>
                  <label htmlFor="direct-skill" className="block text-base font-medium text-gray-700 mb-2">Skill Name</label>
                  <input id="direct-skill" type="text" value={directSkill} onChange={(e) => setDirectSkill(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" placeholder="e.g., React, Solidity" />
                </div>
                <button onClick={handleDirectAssignSkill} disabled={!directUser.trim() || !directSkill.trim() || isDirectAssignPending || isDirectAssignConfirming} className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-normal py-3 px-8 rounded-xl shadow-md transition-all duration-300">
                  {isDirectAssignPending ? 'Confirming...' : isDirectAssignConfirming ? 'Processing...' : 'Assign Skill'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-2xl font-light text-gray-800 mb-4">Resolve Challenge</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="resolve-claim" className="block text-base font-medium text-gray-700 mb-2">Claim ID</label>
                  <input id="resolve-claim" type="number" value={resolveClaimId} onChange={(e) => setResolveClaimId(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" placeholder="Enter claim ID to resolve" />
                </div>
                <button onClick={handleResolveChallenge} disabled={!resolveClaimId.trim() || isResolvePending || isResolveConfirming} className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-normal py-3 px-8 rounded-xl shadow-md transition-all duration-300">
                  {isResolvePending ? 'Confirming...' : isResolveConfirming ? 'Processing...' : 'Resolve Challenge'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-2xl font-light text-red-500 mb-4">Emergency Withdraw</h3>
              <p className="text-sm text-gray-600 mb-4">Withdraw all contract balance to owner address. Use only in emergencies.</p>
              <button onClick={handleEmergencyWithdraw} disabled={isWithdrawPending || isWithdrawConfirming} className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all duration-300">
                {isWithdrawPending ? 'Confirming...' : isWithdrawConfirming ? 'Processing...' : 'Emergency Withdraw'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h3 className="text-2xl font-light text-gray-800 mb-4">Contract Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="text-4xl font-light text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                {availableSkills?.length || 0}
              </div>
              <div className="text-base text-gray-600 mt-1">Available Skills</div>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="text-4xl font-light text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                {skillClaims?.length || 0}
              </div>
              <div className="text-base text-gray-600 mt-1">Total Claims</div>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="text-4xl font-light text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                {challenges?.length || 0}
              </div>
              <div className="text-base text-gray-600 mt-1">Active Challenges</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;