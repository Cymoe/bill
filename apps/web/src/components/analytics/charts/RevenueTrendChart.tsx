import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { formatCurrency } from '../../../utils/format';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RevenueTrendChartProps {
  data: {
    labels: string[];
    revenue: number[];
    profit: number[];
    expenses: number[];
  };
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ data }) => {
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
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
              label += formatCurrency(context.parsed.y);
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
          display: true
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
          color: 'rgba(255, 255, 255, 0.1)',
          display: true
        },
        ticks: {
          color: '#9E9E9E',
          font: {
            family: 'Roboto Mono',
            size: 11
          },
          callback: function(value) {
            return formatCurrency(Number(value));
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
    labels: data.labels,
    datasets: [
      {
        label: 'Revenue',
        data: data.revenue,
        borderColor: '#336699',
        backgroundColor: 'rgba(51, 102, 153, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#336699',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      },
      {
        label: 'Profit',
        data: data.profit,
        borderColor: '#388E3C',
        backgroundColor: 'rgba(56, 142, 60, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#388E3C',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      },
      {
        label: 'Expenses',
        data: data.expenses,
        borderColor: '#D32F2F',
        backgroundColor: 'rgba(211, 47, 47, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#D32F2F',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      }
    ]
  };

  return (
    <div className="bg-[#333333] rounded-[4px] p-6">
      <h3 className="text-lg font-medium mb-4">FINANCIAL TRENDS</h3>
      <div style={{ height: '300px' }}>
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
}; 