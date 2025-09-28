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

const levelDescriptions: { [key: number]: string } = {
  1: "Intern",
  2: "Junior",
  3: "Mid-level",
  4: "Senior",
  5: "Expert",
};

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
    <div className="flex flex-col items-center min-h-screen bg-white text-gray-800 p-8 font-sans">
      <div className="w-full max-w-3xl mx-auto">
        <h1 className="text-5xl font-light text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
          Who would you like to hire today?
        </h1>
        <form onSubmit={handleSearch} className="flex shadow-lg rounded-2xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-5 text-lg bg-gray-50 text-gray-800 rounded-l-2xl focus:outline-none placeholder:text-gray-400"
            placeholder="e.g., 'Expert React developer with some knowledge of Go'"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-normal py-4 px-10 rounded-r-2xl shadow-md transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading ? 'Parsing...' : 'Send'}
          </button>
        </form>
      </div>

      {skills.length > 0 && !showResults && (
        <div className="w-full max-w-3xl mt-12">
          <h2 className="text-3xl font-light text-center mb-8">Adjust Skill Requirements</h2>
          <div className="space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
            {requirements.map(({ skill, level }, index) => (
              <div key={`${skill}-${index}`}>
                <label htmlFor={skill} className="text-xl font-normal mb-3 flex justify-between items-center text-gray-700">
                  <span>{skill}</span>
                  <span className="text-lg font-normal text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                    Level {level} - {levelDescriptions[level]}
                  </span>
                </label>
                <input
                  id={skill}
                  type="range"
                  min="1"
                  max="5"
                  value={level}
                  onChange={(e) => handleSliderChange(skill, parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button
              onClick={handleFindCandidates}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-normal py-4 px-12 rounded-2xl text-xl shadow-lg transition-all duration-300"
            >
              Find Candidates
            </button>
          </div>
        </div>
      )}

      {showResults && (
         <div className="w-full max-w-4xl mt-12">
          <h2 className="text-4xl font-light text-center mb-10">Hiring Results</h2>
          <div className="space-y-6">
            {people.map((person, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between transition-all hover:shadow-xl">
                <div className="flex items-center">
                  <span className="text-4xl font-light mr-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">{person.score}</span>
                  <div>
                    <p className="text-2xl font-normal text-gray-800">{person.name}</p>
                    <a href={person.github} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {person.github}
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center text-green-500">
                    <span className="text-3xl">▲</span>
                    <span className="ml-2 text-lg font-normal">{person.upward_trend}</span>
                  </div>
                  <div className="flex items-center text-red-500">
                    <span className="text-3xl">▼</span>
                    <span className="ml-2 text-lg font-normal">{person.downward_trend}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* For debugging: display the requirements array */}
      {requirements.length > 0 && !showResults && (
        <div className="w-full max-w-3xl mt-10 bg-gray-50 p-6 rounded-2xl border border-gray-200">
          <h3 className="text-lg font-normal text-gray-600">Current Requirements Array:</h3>
          <pre className="text-sm bg-gray-100 text-gray-800 p-4 rounded-lg mt-2 overflow-x-auto">
            {JSON.stringify(requirements, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}