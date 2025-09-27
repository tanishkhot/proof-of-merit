'use client'; // This needs to be a client component to use state and effects

import React, { useState, useEffect } from 'react';

const AttestPage = () => {
  // Static data for demonstration
  const problem = {
    statement: 'Create a simple "To-Do List" application using React. The application should allow users to add tasks, mark tasks as completed, and delete tasks. The state should be managed within the component.',
    skill: 'React',
    difficulty: 'Beginner',
  };

  const [timeLeft, setTimeLeft] = useState(2 * 60 * 60); // 2 hours in seconds
  const [timeUp, setTimeUp] = useState(false);

  useEffect(() => {
    if (timeLeft === 0) {
      setTimeUp(true);
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Claim Skill Attestation</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Problem Statement</h2>
            </div>
            <div className="text-2xl font-bold text-red-500">
                {formatTime(timeLeft)}
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6">{problem.statement}</p>
          

          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Skill</h3>
              <p className="text-gray-600 dark:text-gray-400">{problem.skill}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Difficulty</h3>
              <p className="text-gray-600 dark:text-gray-400">{problem.difficulty}</p>
            </div>
          </div>

          <div>
            <label htmlFor="github-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Solution (GitHub URL)
            </label>
            <input
              type="text"
              id="github-url"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="https://github.com/your-username/your-repo"
            />
          </div>

          <div className="flex justify-end mt-6">
            <button 
              className={`text-white font-bold py-2 px-4 rounded ${timeUp ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-700'}`}
              disabled={timeUp}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttestPage;