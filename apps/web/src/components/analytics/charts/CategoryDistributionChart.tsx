import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { formatCurrency } from '../../../utils/format';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryData {
  name: string;
  revenue: number;
  color: string;
}

interface CategoryDistributionChartProps {
  data: CategoryData[];
}

export const CategoryDistributionChart: React.FC<CategoryDistributionChartProps> = ({ data }) => {
  const options: ChartOptions<'doughnut'> = {
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
          padding: 15,
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            const labels = chart.data.labels as string[];
            const backgroundColor = datasets[0].backgroundColor as string[];
            
            return labels.map((label, i) => ({
              text: `${label} - ${formatCurrency(datasets[0].data[i] as number)}`,
              fillStyle: backgroundColor[i],
              strokeStyle: backgroundColor[i],
              lineWidth: 0,
              hidden: false,
              index: i
            }));
          }
        }
      },
      tooltip: {
        backgroundColor: '#1E1E1E',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#336699',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => (a as number) + (b as number), 0) as number;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%',
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  const chartData = {
    labels: data.map(d => d.name),
    datasets: [{
      data: data.map(d => d.revenue),
      backgroundColor: data.map(d => d.color),
      borderColor: '#333333',
      borderWidth: 2,
      hoverOffset: 4
    }]
  };

  // Calculate total revenue
  const totalRevenue = data.reduce((sum, cat) => sum + cat.revenue, 0);

  return (
    <div className="bg-[#333333] rounded-[4px] p-6">
      <h3 className="text-lg font-medium mb-4">REVENUE BY CATEGORY</h3>
      <div style={{ height: '300px', position: 'relative' }}>
        <Doughnut options={options} data={chartData} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-xs text-gray-400 uppercase">Total Revenue</p>
            <p className="text-2xl font-mono font-semibold">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 