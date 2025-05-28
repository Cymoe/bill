import React from 'react';

export interface StatItem {
  label: string;
  value: string | number;
  subValue?: string;
  color?: 'default' | 'green' | 'yellow' | 'red';
  isMonospace?: boolean;
}

interface StatsBarProps {
  stats: StatItem[];
  className?: string;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats, className = '' }) => {
  const formatValue = (value: string | number, isMonospace?: boolean) => {
    const className = isMonospace ? 'font-mono' : '';
    return <span className={className}>{value}</span>;
  };

  const getColorClass = (color?: string) => {
    switch (color) {
      case 'green':
        return 'text-green-400';
      case 'yellow':
        return 'text-[#F9D71C]';
      case 'red':
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };

  return (
    <div className={`bg-[#121212] border-b border-[#333333] ${className}`}>
      <div className="px-0 py-3">
        <div className="flex items-center gap-6 text-sm">
          {stats.map((stat, index) => (
            <React.Fragment key={index}>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 uppercase tracking-wide text-xs font-medium">
                  {stat.label}
                </span>
                <span className={`font-medium ${getColorClass(stat.color)}`}>
                  {formatValue(stat.value, stat.isMonospace)}
                </span>
                {stat.subValue && (
                  <span className="text-gray-500 text-xs">
                    {stat.subValue}
                  </span>
                )}
              </div>
              {index < stats.length - 1 && (
                <div className="w-px h-4 bg-[#333333]" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}; 