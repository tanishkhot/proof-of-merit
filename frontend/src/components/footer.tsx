'use client';

import React from 'react';

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full py-4 bg-white border-t border-gray-100 shadow-t-lg">
      <div className="text-center">
        <p className="text-base font-light text-gray-500 animate-pulse">
          Built at{' '}
          <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
            EthGlobal New Delhi
          </span>
        </p>
      </div>
    </footer>
  );
}
