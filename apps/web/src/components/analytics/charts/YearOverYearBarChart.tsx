import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { formatCurrency } from '../../../utils/format';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface YoYData {
  month: string;
  currentYear: number;
  previousYear: number;
  percentageChange: number;
}

interface YearOverYearBarChartProps {
  data: YoYData[];
  metric: 'revenue' | 'profit' | 'projects';
  currentYear: number;
  previousYear: number;
}

export const YearOverYearBarChart: React.FC<YearOverYearBarChartProps> = ({
  data,
  metric,
  currentYear,
  previousYear
}) => {
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

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `YEAR-OVER-YEAR ${getMetricLabel().toUpperCase()}`,
        color: '#ffffff',
        font: {
          family: 'Roboto Condensed',
          size: 18,
          weight: '700'
        },
        padding: { bottom: 20 }
      },
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#ffffff',
          font: {
            family: 'Roboto',
            size: 12
          },
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: '#1E1E1E',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#336699',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatValue(context.parsed.y);
            }
            
            // Add percentage change for current year
            if (context.dataset.label === currentYear.toString() && context.dataIndex < data.length) {
              const change = data[context.dataIndex].percentageChange;
              label += ` (${change > 0 ? '+' : ''}${change.toFixed(1)}%)`;
            }
            
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          display: false
        },
        ticks: {
          color: '#9E9E9E',
          font: {
            family: 'Roboto',
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#9E9E9E',
          font: {
            family: 'Roboto Mono',
            size: 11
          },
          callback: function(value) {
            return formatValue(Number(value));
          }
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false
    }
  };

  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: currentYear.toString(),
        data: data.map(d => d.currentYear),
        backgroundColor: '#336699',
        borderColor: '#336699',
        borderWidth: 1,
        borderRadius: 4
      },
      {
        label: previousYear.toString(),
        data: data.map(d => d.previousYear),
        backgroundColor: 'rgba(158, 158, 158, 0.6)',
        borderColor: '#9E9E9E',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  // Calculate totals
  const currentTotal = data.reduce((sum, d) => sum + d.currentYear, 0);
  const previousTotal = data.reduce((sum, d) => sum + d.previousYear, 0);
  const totalChange = previousTotal > 0 
    ? ((currentTotal - previousTotal) / previousTotal) * 100 
    : 0;

  return (
    <div className="bg-[#333333] rounded-[4px] p-6">
      <div style={{ height: '350px' }}>
        <Bar options={options} data={chartData} />
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#1E1E1E]">
        <div className="text-center">
          <p className="text-xs text-gray-400 uppercase mb-1">{currentYear} Total</p>
          <p className="text-lg font-mono font-semibold">{formatValue(currentTotal)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 uppercase mb-1">{previousYear} Total</p>
          <p className="text-lg font-mono font-semibold">{formatValue(previousTotal)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 uppercase mb-1">YoY Change</p>
          <p className={`text-lg font-semibold ${
            totalChange > 0 ? 'text-[#388E3C]' : totalChange < 0 ? 'text-[#D32F2F]' : 'text-gray-400'
          }`}>
            {totalChange > 0 ? '+' : ''}{totalChange.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}; 