'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to ensure this component only loads on client side
const ResolvePageContent = dynamic(() => import('./resolve-content'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-white text-gray-800 p-8 font-sans flex flex-col justify-center items-center">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-light mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Loading...</h1>
        <p className="text-xl text-gray-600 font-light mb-8">
          Initializing Web3 connection...
        </p>
      </div>
    </div>
  )
});

const ResolvePage = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white text-gray-800 p-8 font-sans flex flex-col justify-center items-center">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-light mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Loading...</h1>
          <p className="text-xl text-gray-600 font-light mb-8">
            Initializing Web3 connection...
          </p>
        </div>
      </div>
    );
  }

  return <ResolvePageContent />;
};

export default ResolvePage;