'use client';

import { useState, useEffect } from 'react';

export default function SearchBar({ initialValue = '', onSearch, delay = 500 }) {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  // Sync internal state if URL search query changes externally (e.g. back button)
  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  // Debounce implementation without external libraries
  useEffect(() => {
    const handler = setTimeout(() => {
      // Trigger callback only if search term actually changed
      if (searchTerm !== initialValue) {
        onSearch(searchTerm);
      }
    }, delay);

    // Cleanup timer on every keystroke
    return () => clearTimeout(handler);
  }, [searchTerm, initialValue, onSearch, delay]);

  return (
    <div className="mb-6 max-w-md">
      <label htmlFor="search" className="sr-only">
        Search Products
      </label>
      <div className="relative">
        <input
          id="search"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products by title..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900 bg-white"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              onSearch('');
            }}
            className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}