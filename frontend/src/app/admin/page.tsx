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

  // Check if the connected address is the contract owner
  // For now, we'll show this page to everyone, but in production you'd check against the owner
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
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Connect Your Wallet</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Please connect your wallet to access admin functions
          </p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Access Denied</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Only the contract owner can access admin functions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Owner Dashboard</h1>
          <WalletConnect />
        </div>

        {/* Success Messages */}
        {isAddSkillSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Skill added successfully! Transaction hash: {addSkillHash}
          </div>
        )}
        {isRemoveSkillSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Skill removed successfully! Transaction hash: {removeSkillHash}
          </div>
        )}
        {isUpdateSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Problem statement updated successfully! Transaction hash: {updateHash}
          </div>
        )}
        {isSetResolverSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Resolver updated successfully! Transaction hash: {setResolverHash}
          </div>
        )}
        {isDirectAssignSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Skill directly assigned successfully! Transaction hash: {directAssignHash}
          </div>
        )}
        {isResolveSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Challenge resolved successfully! Transaction hash: {resolveHash}
          </div>
        )}
        {isWithdrawSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Emergency withdrawal successful! Transaction hash: {withdrawHash}
          </div>
        )}

        {/* Error Messages */}
        {(addSkillError || removeSkillError || updateError || setResolverError || directAssignError || resolveError || withdrawError) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {(addSkillError || removeSkillError || updateError || setResolverError || directAssignError || resolveError || withdrawError)?.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Current Skills */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Available Skills</h3>
              {skillsLoading ? (
                <p className="text-gray-600 dark:text-gray-400">Loading skills...</p>
              ) : availableSkills && availableSkills.length > 0 ? (
                <div className="space-y-2">
                  {availableSkills.map((skill: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="font-medium text-gray-800 dark:text-gray-200">{skill}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Available</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No skills available yet</p>
              )}
            </div>

            {/* Add New Skill */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Add New Skill</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="skill-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Skill Name
                  </label>
                  <input
                    type="text"
                    id="skill-name"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., React, Solidity, JavaScript"
                  />
                </div>
                <div>
                  <label htmlFor="problem-statement" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Problem Statement
                  </label>
                  <textarea
                    id="problem-statement"
                    value={problemStatement}
                    onChange={(e) => setProblemStatement(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe the problem that users need to solve to claim this skill..."
                  />
                </div>
                <button
                  onClick={handleAddSkill}
                  disabled={!newSkill.trim() || !problemStatement.trim() || isAddSkillPending || isAddSkillConfirming}
                  className="w-full bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                >
                  {isAddSkillPending ? 'Confirming...' : isAddSkillConfirming ? 'Processing...' : 'Add Skill'}
                </button>
              </div>
            </div>

            {/* Remove Skill */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Remove Skill</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="remove-skill" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Skill to Remove
                  </label>
                  <select
                    id="remove-skill"
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a skill...</option>
                    {availableSkills?.map((skill: string) => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleRemoveSkill}
                  disabled={!selectedSkill || isRemoveSkillPending || isRemoveSkillConfirming}
                  className="w-full bg-red-500 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                >
                  {isRemoveSkillPending ? 'Confirming...' : isRemoveSkillConfirming ? 'Processing...' : 'Remove Skill'}
                </button>
              </div>
            </div>

            {/* Update Problem Statement */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Update Problem Statement</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="update-skill" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Skill
                  </label>
                  <select
                    id="update-skill"
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a skill...</option>
                    {availableSkills?.map((skill: string) => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="new-problem" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Problem Statement
                  </label>
                  <textarea
                    id="new-problem"
                    value={newProblemStatement}
                    onChange={(e) => setNewProblemStatement(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter the new problem statement..."
                  />
                </div>
                <button
                  onClick={handleUpdateProblemStatement}
                  disabled={!selectedSkill || !newProblemStatement.trim() || isUpdatePending || isUpdateConfirming}
                  className="w-full bg-yellow-500 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                >
                  {isUpdatePending ? 'Confirming...' : isUpdateConfirming ? 'Processing...' : 'Update Problem Statement'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Set Resolver */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Set Resolver</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="resolver-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Resolver Address
                  </label>
                  <input
                    type="text"
                    id="resolver-address"
                    value={newResolver}
                    onChange={(e) => setNewResolver(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0x..."
                  />
                </div>
                <button
                  onClick={handleSetResolver}
                  disabled={!newResolver.trim() || isSetResolverPending || isSetResolverConfirming}
                  className="w-full bg-purple-500 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                >
                  {isSetResolverPending ? 'Confirming...' : isSetResolverConfirming ? 'Processing...' : 'Set Resolver'}
                </button>
              </div>
            </div>

            {/* Directly Assign Skill */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Directly Assign Skill</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="direct-user" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    User Address
                  </label>
                  <input
                    type="text"
                    id="direct-user"
                    value={directUser}
                    onChange={(e) => setDirectUser(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0x..."
                  />
                </div>
                <div>
                  <label htmlFor="direct-skill" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Skill Name
                  </label>
                  <input
                    type="text"
                    id="direct-skill"
                    value={directSkill}
                    onChange={(e) => setDirectSkill(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., React, Solidity"
                  />
                </div>
                <button
                  onClick={handleDirectAssignSkill}
                  disabled={!directUser.trim() || !directSkill.trim() || isDirectAssignPending || isDirectAssignConfirming}
                  className="w-full bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                >
                  {isDirectAssignPending ? 'Confirming...' : isDirectAssignConfirming ? 'Processing...' : 'Assign Skill'}
                </button>
              </div>
            </div>

            {/* Resolve Challenge */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Resolve Challenge</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="resolve-claim" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Claim ID
                  </label>
                  <input
                    type="number"
                    id="resolve-claim"
                    value={resolveClaimId}
                    onChange={(e) => setResolveClaimId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter claim ID to resolve"
                  />
                </div>
                <button
                  onClick={handleResolveChallenge}
                  disabled={!resolveClaimId.trim() || isResolvePending || isResolveConfirming}
                  className="w-full bg-orange-500 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                >
                  {isResolvePending ? 'Confirming...' : isResolveConfirming ? 'Processing...' : 'Resolve Challenge'}
                </button>
              </div>
            </div>

            {/* Emergency Withdraw */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Emergency Withdraw</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Withdraw all contract balance to owner address. Use only in emergencies.
              </p>
              <button
                onClick={handleEmergencyWithdraw}
                disabled={isWithdrawPending || isWithdrawConfirming}
                className="w-full bg-red-600 hover:bg-red-800 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
              >
                {isWithdrawPending ? 'Confirming...' : isWithdrawConfirming ? 'Processing...' : 'Emergency Withdraw'}
              </button>
            </div>
          </div>
        </div>

        {/* Contract Stats */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Contract Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {availableSkills?.length || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Available Skills</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {skillClaims?.length || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Claims</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {challenges?.length || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Challenges</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;