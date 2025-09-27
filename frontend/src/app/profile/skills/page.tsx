import React from 'react';

const SkillsPage = () => {
  const skills = {
    claimed: ['JavaScript', 'React', 'Node.js'],
    pending: ['Solidity', 'Ethers.js'],
    verified: ['Next.js', 'Tailwind CSS'],
    rejected: ['GraphQL'],
  };

  return (
    <div className="w-full h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Your Skills</h1>
      <div className="grid grid-cols-4 gap-4 h-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Claimed</h2>
          <ul>
            {skills.claimed.map(skill => (
              <li key={skill} className="text-gray-700 dark:text-gray-300 py-1">{skill}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Pending</h2>
          <ul>
            {skills.pending.map(skill => (
              <li key={skill} className="text-gray-700 dark:text-gray-300 py-1">{skill}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Verified</h2>
          <ul>
            {skills.verified.map(skill => (
              <li key={skill} className="text-gray-700 dark:text-gray-300 py-1">{skill}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Rejected</h2>
          <ul>
            {skills.rejected.map(skill => (
              <li key={skill} className="text-gray-700 dark:text-gray-300 py-1">{skill}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SkillsPage;
