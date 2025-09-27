'use client';

import { useState } from 'react';

// Define types for our data structures
interface Skill {
  skill: string;
  level: number;
}

type Requirement = Skill;

// Static data for initial display - will be replaced by API call
const people = [
  { name: 'John Doe', github: 'https://github.com/johndoe', score: 95, upward_trend: 10, downward_trend: 2 },
  { name: 'Jane Smith', github: 'https://github.com/janesmith', score: 88, upward_trend: 5, downward_trend: 8 },
  { name: 'Peter Jones', github: 'https://github.com/peterjones', score: 92, upward_trend: 12, downward_trend: 1 },
];

export default function RecruitPage() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setSkills([]);
    setRequirements([]);
    setShowResults(false);

    try {
      // Use the backend running on port 8000
      const response = await fetch('http://localhost:8000/api/aisearch/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Skill[] = await response.json();

      setSkills(data);
      setRequirements(data); // Initialize requirements with the parsed skills

    } catch (error) {
      console.error("Failed to fetch skills:", error);
      // Fallback to static data on error for demonstration
      const staticSkills: Skill[] = [
        { skill: "React", level: 5 },
        { skill: "Node.js", level: 4 },
        { skill: "Go", level: 2 },
      ];
      setSkills(staticSkills);
      setRequirements(staticSkills);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSliderChange = (skillName: string, level: number) => {
    setRequirements(prev =>
      prev.map(req => (req.skill === skillName ? { ...req, level } : req))
    );
  };

  const handleFindCandidates = () => {
    // This will eventually send the `requirements` array to the backend
    console.log('Final requirements:', requirements);
    setShowResults(true);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-8">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center mb-8">Who would you like to hire today?</h1>
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-4 text-lg bg-gray-800 text-white rounded-l-lg focus:outline-none placeholder:text-gray-400"
            placeholder="e.g., 'Expert React developer with some knowledge of Go'"
            disabled={isLoading}
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-r-lg" disabled={isLoading}>
            {isLoading ? 'Parsing...' : 'Send'}
          </button>
        </form>
      </div>

      {skills.length > 0 && !showResults && (
        <div className="w-full max-w-2xl mt-10">
          <h2 className="text-2xl font-semibold text-center mb-6">Adjust Skill Requirements</h2>
          <div className="space-y-6 bg-gray-800 p-6 rounded-lg">
            {requirements.map(({ skill, level }) => (
              <div key={skill}>
                <label htmlFor={skill} className="block text-lg font-medium mb-2 flex justify-between">
                  <span>{skill}</span>
                  <span className="text-blue-400 font-bold">{level}</span>
                </label>
                <input
                  id={skill}
                  type="range"
                  min="1"
                  max="5"
                  value={level}
                  onChange={(e) => handleSliderChange(skill, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <button onClick={handleFindCandidates} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-10 rounded-lg text-lg">
              Find Candidates
            </button>
          </div>
        </div>
      )}

      {showResults && (
         <div className="w-full max-w-4xl mt-10">
          <h2 className="text-3xl font-bold text-center mb-8">Hiring Results</h2>
          <div className="space-y-4">
            {people.map((person, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl font-bold mr-4">{person.score}</span>
                  <div>
                    <p className="text-xl font-semibold">{person.name}</p>
                    <a href={person.github} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                      {person.github}
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-green-500">
                    <span className="text-2xl">▲</span>
                    <span className="ml-1">{person.upward_trend}</span>
                  </div>
                  <div className="flex items-center text-red-500">
                    <span className="text-2xl">▼</span>
                    <span className="ml-1">{person.downward_trend}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* For debugging: display the requirements array */}
      {requirements.length > 0 && !showResults && (
        <div className="w-full max-w-2xl mt-8 bg-gray-900 p-4 rounded">
          <h3 className="text-lg font-semibold">Current Requirements Array:</h3>
          <pre className="text-sm bg-black text-white p-4 rounded mt-2 overflow-x-auto">
            {JSON.stringify(requirements, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}