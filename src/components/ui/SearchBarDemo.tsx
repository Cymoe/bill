import React, { useState } from 'react';

const SearchBarDemo: React.FC = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  
  return (
    <div className="p-8 bg-[#121212] min-h-screen flex flex-col items-center">
      <h1 className="text-white text-2xl font-bold mb-8">Expandable Search Bar Demo</h1>
      
      <div className="flex items-center justify-between w-full max-w-3xl bg-[#1E1E1E] p-4 rounded-[4px] mb-8">
        <h2 className="text-white font-bold">Dashboard</h2>
        
        {/* Expandable search bar */}
        <div className="relative">
          <div className={`bg-[#333333] rounded-[4px] flex items-center px-3 py-2 transition-all duration-300 ease-in-out ${isFocused ? 'w-64' : 'w-40'}`}>
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="bg-transparent border-none w-full text-white text-sm focus:outline-none ml-2 placeholder-gray-400"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-[#333333] p-6 rounded-[4px] w-full max-w-3xl">
        <h3 className="text-white font-bold mb-4">Implementation Details</h3>
        <ul className="text-white space-y-2">
          <li>• Uses transition-all for smooth width animation</li>
          <li>• Width changes from w-40 to w-64 on focus</li>
          <li>• Follows the Construction Business Tool Design System</li>
          <li>• Angular elements with 4px border radius</li>
          <li>• Concrete Gray (#333333) background</li>
          <li>• Steel Blue accents for interactive elements</li>
        </ul>
      </div>
    </div>
  );
};

export default SearchBarDemo;
