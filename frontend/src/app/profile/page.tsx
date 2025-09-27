'use client';
import React, { useState } from 'react';
import Link from 'next/link';

const ProfilePage = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const skills = ['JavaScript', 'React', 'Node.js', 'Solidity', 'Ethers.js'];

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="relative h-48 bg-gray-300 dark:bg-gray-700">
        {/* Banner Image */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://placehold.co/1200x200')" }}></div>
        <div className="absolute bottom-0 left-8 transform translate-y-1/2">
          {/* Profile Picture */}
          <div className="w-32 h-32 rounded-full bg-gray-400 dark:bg-gray-600 border-4 border-white dark:border-gray-800 bg-cover bg-center" style={{ backgroundImage: "url('https://placehold.co/128x128')" }}></div>
        </div>
      </div>

      <div className="mt-24 px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">John Doe</h1>
        <p className="text-md text-gray-600 dark:text-gray-400">@johndoe.eth</p>
      </div>

      <div className="px-8 py-4 mt-4">
        <div className="flex space-x-4">
          <Link href="/profile/skills">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Your verified skills
            </button>
          </Link>

          <Link href="/challenges">
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              See challenges
            </button>
          </Link>
        </div>
        <div className="mt-4">
          <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">
            Claim a skill
          </button>
          {isDropdownOpen && (
            <div className="mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                {skills.map(skill => (
                  <a href="#" key={skill} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700" role="menuitem">{skill}</a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-8 py-4 mt-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Skills</h2>
        <div className="flex flex-wrap gap-2 mt-2">
          {skills.slice(0, 3).map(skill => (
            <span key={skill} className="inline-block bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-200">{skill}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
