import React from 'react';

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="bg-[#121212] rounded-[4px] border border-[#333333] p-6 animate-pulse">
      <div className="w-48 h-6 bg-[#1E1E1E] rounded-[4px] mb-4"></div>
      <div className="h-80 bg-[#1E1E1E] rounded-[4px]"></div>
    </div>
  );
};