import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface YoYData {
  month: string;
  currentYear: number;
  previousYear: number;
  percentageChange: number;
}

interface YearOverYearChartProps {
  data: YoYData[];
  metric: 'revenue' | 'profit' | 'projects';
  currentYear: number;
  previousYear: number;
}

export const YearOverYearChart: React.FC<YearOverYearChartProps> = ({
  data,
  metric,
  currentYear,
  previousYear
}) => {
  const maxValue = Math.max(
    ...data.map(d => Math.max(d.currentYear, d.previousYear))
  );

  const getMetricLabel = () => {
    switch (metric) {
      case 'revenue': return 'Revenue';
      case 'profit': return 'Profit';
      case 'projects': return 'Projects';
    }
  };

  const formatValue = (value: number) => {
    if (metric === 'projects') return value.toString();
    return formatCurrency(value);
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-[#388E3C]" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-[#D32F2F]" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  // Calculate totals
  const currentTotal = data.reduce((sum, d) => sum + d.currentYear, 0);
  const previousTotal = data.reduce((sum, d) => sum + d.previousYear, 0);
  const totalChange = previousTotal > 0 
    ? ((currentTotal - previousTotal) / previousTotal) * 100 
    : 0;

  return (
    <div className="bg-[#333333] rounded-[4px] p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">YEAR-OVER-YEAR {getMetricLabel().toUpperCase()}</h3>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-[#336699]"></div>
            <span className="text-sm text-gray-400">{currentYear}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-[#9E9E9E]"></div>
            <span className="text-sm text-gray-400">{previousYear}</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <p className="text-xs text-gray-400 uppercase mb-1">{currentYear} Total</p>
          <p className="text-xl font-mono font-semibold">{formatValue(currentTotal)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase mb-1">{previousYear} Total</p>
          <p className="text-xl font-mono font-semibold">{formatValue(previousTotal)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase mb-1">YoY Change</p>
          <div className="flex items-center gap-2">
            {getTrendIcon(totalChange)}
            <p className={`text-xl font-semibold ${
              totalChange > 0 ? 'text-[#388E3C]' : totalChange < 0 ? 'text-[#D32F2F]' : 'text-gray-400'
            }`}>
              {Math.abs(totalChange).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.month}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{item.month}</span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">{formatValue(item.currentYear)}</span>
                <div className="flex items-center gap-1">
                  {getTrendIcon(item.percentageChange)}
                  <span className={`text-xs ${
                    item.percentageChange > 0 ? 'text-[#388E3C]' : 
                    item.percentageChange < 0 ? 'text-[#D32F2F]' : 
                    'text-gray-400'
                  }`}>
                    {Math.abs(item.percentageChange).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
            
            {/* Bar comparison */}
            <div className="space-y-1">
              {/* Current year bar */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-12">{currentYear}</span>
                <div className="flex-1 h-6 bg-[#1E1E1E] rounded-[2px] overflow-hidden">
                  <div 
                    className="h-full bg-[#336699] transition-all duration-500"
                    style={{ width: `${(item.currentYear / maxValue) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Previous year bar */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-12">{previousYear}</span>
                <div className="flex-1 h-6 bg-[#1E1E1E] rounded-[2px] overflow-hidden">
                  <div 
                    className="h-full bg-[#9E9E9E] transition-all duration-500"
                    style={{ width: `${(item.previousYear / maxValue) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 