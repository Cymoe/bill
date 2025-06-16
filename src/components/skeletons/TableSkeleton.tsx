import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="bg-[#121212] border border-[#333333] overflow-hidden animate-pulse">
      <div className="grid grid-cols-1 divide-y divide-[#333333]">
        {/* Header */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-[#1E1E1E]">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={`header-${i}`} className="h-4 bg-[#333333]"></div>
          ))}
        </div>

        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="grid grid-cols-4 gap-4 p-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={`cell-${rowIndex}-${colIndex}`} className="h-4 bg-[#333333]"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};