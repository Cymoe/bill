import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#121212] border border-[#333333] p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="w-1/3 h-6 bg-[#1E1E1E]"></div>
        <div className="w-10 h-10 bg-[#1E1E1E]"></div>
      </div>
      <div className="space-y-3">
        <div className="w-1/2 h-4 bg-[#1E1E1E]"></div>
        <div className="w-1/4 h-4 bg-[#1E1E1E]"></div>
      </div>
    </div>
  );
};