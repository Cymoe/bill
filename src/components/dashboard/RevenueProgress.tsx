import React from 'react';
import { formatCurrency } from '../../utils/format';

interface RevenueProgressProps {
  currentValue: number;
  outstandingAmount: number;
  targetValue: number;
}

export const RevenueProgress: React.FC<RevenueProgressProps> = ({ 
  currentValue, 
  outstandingAmount,
  targetValue 
}) => {
  const percentage = Math.min(Math.round((currentValue / targetValue) * 100), 100);
  const outstandingPercentage = Math.min(Math.round((outstandingAmount / targetValue) * 100), 100);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Progress</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">{percentage}%</span> of target reached
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Outstanding Amount</p>
          <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
            {formatCurrency(outstandingAmount)}
          </p>
        </div>
      </div>

      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
        {/* Current revenue (green) */}
        <div 
          className="h-full bg-emerald-500 dark:bg-emerald-400 animate-progress-fill absolute left-0 top-0"
          style={{ '--progress-width': `${percentage}%` } as React.CSSProperties}
        />
        {/* Outstanding amount (orange) */}
        <div 
          className="h-full bg-orange-500 dark:bg-orange-400 transition-all duration-500 absolute top-0"
          style={{ left: `${percentage}%`, width: `${outstandingPercentage}%` }}
        />
      </div>

      <div className="mt-4 flex justify-between items-center text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Current Revenue</p>
          <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(currentValue)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-500 dark:text-gray-400">Target Revenue</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatCurrency(targetValue)}
          </p>
        </div>
      </div>
    </div>
  );
};