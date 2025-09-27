import React from 'react';

const conflicts = [
  {
    claimant: { name: 'Alice', github: 'https://github.com/alice' },
    submissionUrl: 'https://github.com/alice/project',
    challenger: { name: 'Bob', github: 'https://github.com/bob' },
    challengeReasonUrl: 'https://github.com/bob/challenge-reason/1',
  },
  {
    claimant: { name: 'Charlie', github: 'https://github.com/charlie' },
    submissionUrl: 'https://github.com/charlie/project',
    challenger: { name: 'David', github: 'https://github.com/david' },
    challengeReasonUrl: 'https://github.com/david/challenge-reason/2',
  },
];

const ResolvePage = () => {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Resolve Conflicts</h1>
      <div className="space-y-4">
        {conflicts.map((conflict, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center justify-between">
            <div className="flex-1 text-center">
              <h3 className="font-bold">Claimant</h3>
              <a href={conflict.claimant.github} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{conflict.claimant.name}</a>
            </div>
            <div className="flex-1 text-center border-l border-gray-200 dark:border-gray-700 px-4">
              <h3 className="font-bold">Submission</h3>
              <a href={conflict.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Submission</a>
            </div>
            <div className="flex-1 text-center border-l border-r border-gray-200 dark:border-gray-700 px-4 flex flex-col space-y-2">
                <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Claimant Wins
                </button>
                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                    Challenger Wins
                </button>
            </div>
            <div className="flex-1 text-center border-r border-gray-200 dark:border-gray-700 px-4">
              <h3 className="font-bold">Challenge Reason</h3>
              <a href={conflict.challengeReasonUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Reason</a>
            </div>
            <div className="flex-1 text-center">
              <h3 className="font-bold">Challenger</h3>
              <a href={conflict.challenger.github} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{conflict.challenger.name}</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResolvePage;
