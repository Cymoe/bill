import React from 'react';
import { LucideIcon, ArrowUp, ArrowDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: number;
  trendIcon?: LucideIcon;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendIcon
}) => {
  const isPositive = trend >= 0;
  const TrendIcon = trendIcon || (isPositive ? ArrowUp : ArrowDown);
  const trendColor = isPositive ? 'text-[#388E3C]' : 'text-[#D32F2F]';

  return (
    <div className="bg-[#121212] rounded-[4px] border border-[#333333] p-2">
      <div className="flex items-center justify-between mb-0.5">
        <h3 className="text-xs font-medium text-[#9E9E9E] font-['Roboto'] uppercase whitespace-nowrap mr-1">{title}</h3>
        <div className="p-1 bg-[#1E1E1E] rounded-[4px] flex-shrink-0">
          <Icon className="w-3.5 h-3.5 text-[#336699]" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold text-white font-['Roboto_Condensed'] whitespace-nowrap">{value}</p>
        <div className={`flex items-center ${trendColor} flex-shrink-0`}>
          <TrendIcon className="w-2.5 h-2.5 mr-0.5" />
          <span className="text-xs font-medium font-['Roboto']">{Math.abs(trend)}%</span>
        </div>
      </div>
    </div>
  );
};
