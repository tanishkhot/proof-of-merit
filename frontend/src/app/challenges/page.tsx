import React from 'react';
import Link from 'next/link';

const challenges = [
  {
    user: 'Alice',
    skill: 'JavaScript',
    level: 'Intermediate',
    github_submission_url: 'https://github.com/alice/project',
    time: '2 hours ago',
  },
  {
    user: 'Bob',
    skill: 'Solidity',
    level: 'Advanced',
    github_submission_url: 'https://github.com/bob/project',
    time: '5 hours ago',
  },
  {
    user: 'Charlie',
    skill: 'React',
    level: 'Beginner',
    github_submission_url: 'https://github.com/charlie/project',
    time: '1 day ago',
  },
];

const ChallengesPage = () => {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Open Challenges</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700">
              <th className="px-4 py-2 text-left">User</th>
              <th className="px-4 py-2 text-left">Skill</th>
              <th className="px-4 py-2 text-left">Level</th>
              <th className="px-4 py-2 text-left">GitHub Submission</th>
              <th className="px-4 py-2 text-left">Time</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {challenges.map((challenge, index) => (
              <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                <td className="px-4 py-2">{challenge.user}</td>
                <td className="px-4 py-2">{challenge.skill}</td>
                <td className="px-4 py-2">{challenge.level}</td>
                <td className="px-4 py-2"><a href={challenge.github_submission_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View on GitHub</a></td>
                <td className="px-4 py-2">{challenge.time}</td>
                <td className="px-4 py-2">
                  <Link href="/challenges/challenge">
                    <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                      Challenge this submission
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChallengesPage;
