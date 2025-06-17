import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  variant?: 'invoice' | 'estimate' | 'project' | 'project-cards' | 'default';
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns = 4, variant = 'default' }) => {
  // Invoice/Estimate Grid Layout (12 columns: 6 + 3 + 2 + 1)
  if (variant === 'invoice' || variant === 'estimate') {
    return (
      <div className="animate-pulse">
        {/* Header */}
        <div className="px-6 py-3 border-b border-[#333333]/50 bg-[#1E1E1E]/50">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-6 h-4 bg-[#333333] rounded"></div>
            <div className="col-span-3 h-4 bg-[#333333] rounded"></div>
            <div className="col-span-2 h-4 bg-[#333333] rounded"></div>
            <div className="col-span-1 h-4 bg-[#333333] rounded"></div>
          </div>
        </div>

        {/* Rows */}
        <div className="overflow-hidden rounded-b-[4px]">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-[#333333]/50 last:border-b-0">
              {/* First column with status badge + content */}
              <div className="col-span-6 flex items-center gap-3">
                <div className="w-16 h-6 bg-[#333333] rounded"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-[#333333] rounded w-3/4"></div>
                  <div className="h-3 bg-[#333333] rounded w-1/2"></div>
                </div>
              </div>
              
              {/* Amount column */}
              <div className="col-span-3 text-center space-y-1">
                <div className="h-4 bg-[#333333] rounded w-3/4 mx-auto"></div>
                <div className="h-3 bg-[#333333] rounded w-1/2 mx-auto"></div>
              </div>
              
              {/* Date column */}
              <div className="col-span-2">
                <div className="h-4 bg-[#333333] rounded w-full"></div>
              </div>

              {/* Actions column */}
              <div className="col-span-1 flex justify-end">
                <div className="w-8 h-8 bg-[#333333] rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Project Table Layout (6 columns: Project, Status, Budget, Client, Progress, Actions)
  if (variant === 'project') {
    return (
      <div className="animate-pulse">
        <table className="w-full">
          <thead className="bg-[#1E1E1E] sticky top-0">
            <tr className="text-xs text-gray-400 uppercase">
              <th className="text-left px-6 py-3">
                <div className="h-4 bg-[#333333] rounded w-16"></div>
              </th>
              <th className="text-center px-6 py-3">
                <div className="h-4 bg-[#333333] rounded w-12 mx-auto"></div>
              </th>
              <th className="text-right px-6 py-3">
                <div className="h-4 bg-[#333333] rounded w-16 ml-auto"></div>
              </th>
              <th className="text-left px-6 py-3">
                <div className="h-4 bg-[#333333] rounded w-12"></div>
              </th>
              <th className="text-center px-6 py-3">
                <div className="h-4 bg-[#333333] rounded w-16 mx-auto"></div>
              </th>
              <th className="text-right px-6 py-3">
                <div className="h-4 bg-[#333333] rounded w-4 ml-auto"></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={`row-${rowIndex}`} className="border-b border-[#1E1E1E]">
                {/* Project name + date */}
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="h-4 bg-[#333333] rounded w-32"></div>
                    <div className="h-3 bg-[#333333] rounded w-20"></div>
                  </div>
                </td>
                
                {/* Status badge */}
                <td className="px-6 py-4 text-center">
                  <div className="h-6 bg-[#333333] rounded w-16 mx-auto"></div>
                </td>
                
                {/* Budget */}
                <td className="px-6 py-4 text-right">
                  <div className="h-4 bg-[#333333] rounded w-20 ml-auto"></div>
                </td>
                
                {/* Client */}
                <td className="px-6 py-4">
                  <div className="h-4 bg-[#333333] rounded w-24"></div>
                </td>
                
                {/* Progress bar */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-[#1E1E1E] rounded-full h-2">
                      <div className="bg-[#333333] h-2 rounded-full w-1/3"></div>
                    </div>
                    <div className="h-3 bg-[#333333] rounded w-8"></div>
                  </div>
                </td>
                
                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <div className="w-6 h-6 bg-[#333333] rounded ml-auto"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Project Cards Layout (for main ProjectList component)
  if (variant === 'project-cards') {
    return (
      <div className="bg-[#121212] border-b border-[#333333] overflow-hidden animate-pulse">
        <div className="space-y-0">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={`card-${rowIndex}`} className="p-3 md:p-4 hover:bg-[#333333] transition-colors border-b border-gray-700/30 group cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-2 h-2 bg-[#333333] rounded-full flex-shrink-0"></div>
                    <div className="h-4 bg-[#333333] rounded w-48"></div>
                    <div className="h-5 bg-[#333333] rounded w-16"></div>
                  </div>
                  <div className="flex items-center gap-3 md:gap-4 text-gray-400 text-xs md:text-sm ml-5">
                    <div className="h-3 bg-[#333333] rounded w-20"></div>
                    <div className="h-3 bg-[#333333] rounded w-24"></div>
                    <div className="h-3 bg-[#333333] rounded w-20"></div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="h-4 bg-[#333333] rounded w-8"></div>
                  <div className="w-8 h-8 bg-[#333333] rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default table layout for other components
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