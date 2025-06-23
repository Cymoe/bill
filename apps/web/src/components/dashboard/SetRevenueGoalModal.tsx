import React, { useState } from 'react';
import { X } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface SetRevenueGoalModalProps {
  currentRevenue: number;
  onClose: () => void;
  onSave: (targetAmount: number) => void;
}

export const SetRevenueGoalModal: React.FC<SetRevenueGoalModalProps> = ({
  currentRevenue,
  onClose,
  onSave
}) => {
  const [goalType, setGoalType] = useState<'percentage' | 'fixed'>('percentage');
  const [percentageIncrease, setPercentageIncrease] = useState(20);
  const [fixedAmount, setFixedAmount] = useState(Math.max(currentRevenue * 1.2, 10000));
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handlePercentageChange = (value: number) => {
    setPercentageIncrease(value);
    setFixedAmount(Math.round(currentRevenue * (1 + value / 100)));
  };

  const handleFixedAmountChange = (value: number) => {
    setFixedAmount(value);
    setPercentageIncrease(Math.round(((value - currentRevenue) / currentRevenue) * 100));
  };

  const handleSave = () => {
    setIsClosing(true);
    setTimeout(() => onSave(fixedAmount), 300);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-50'
        }`}
        onClick={handleClose}
      />
      
      <div 
        className={`
          relative w-full max-w-lg
          transition-all duration-300
          transform ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
          bg-white dark:bg-gray-800 
          rounded-lg shadow-xl
          overflow-hidden
        `}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Set Growth Target</h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">Current revenue</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {formatCurrency(currentRevenue)}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <button
                onClick={() => setGoalType('percentage')}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                  goalType === 'percentage'
                    ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                    : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                }`}
              >
                Percentage Growth
              </button>
              <button
                onClick={() => setGoalType('fixed')}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                  goalType === 'fixed'
                    ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                    : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                }`}
              >
                Fixed Amount
              </button>
            </div>

            {goalType === 'percentage' ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-lg font-medium text-gray-900 dark:text-white">
                    Target Growth
                  </label>
                  <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {percentageIncrease}%
                  </span>
                </div>
                
                <div className="relative w-full h-12 flex items-center">
                  <input
                    type="range"
                    min="1"
                    max="200"
                    value={percentageIncrease}
                    onChange={(e) => handlePercentageChange(parseInt(e.target.value))}
                    className="absolute w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:dark:bg-indigo-400
                      [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all
                      [&::-webkit-slider-thumb]:hover:ring-4 [&::-webkit-slider-thumb]:hover:ring-indigo-200 [&::-webkit-slider-thumb]:dark:hover:ring-indigo-900/50"
                  />
                  <div 
                    className="absolute h-2 bg-indigo-600 dark:bg-indigo-400 rounded-l-full"
                    style={{ width: `${(percentageIncrease / 200) * 100}%` }}
                  />
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Target Revenue</span>
                    <span className="text-xl font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(fixedAmount)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="block text-lg font-medium text-gray-900 dark:text-white">
                  Target Revenue Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={fixedAmount}
                    onChange={(e) => handleFixedAmountChange(parseInt(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 text-xl border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min={currentRevenue}
                    step="1000"
                  />
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Growth Percentage</span>
                    <span className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
                      +{percentageIncrease}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex justify-end gap-4">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Set Target
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};