import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryBreakdown = ({ data }) => {
  const categoryColors = {
    travel: '#00D9FF',
    food: '#7B61FF',
    office_supplies: '#00FF88',
    other: '#FFB800'
  };

  const categoryLabels = {
    travel: 'Travel',
    food: 'Food',
    office_supplies: 'Office Supplies',
    other: 'Other'
  };

  const labels = data.map(item => categoryLabels[item.category] || item.category);
  const amounts = data.map(item => item.totalAmount);
  const colors = data.map(item => categoryColors[item.category] || '#B0BEC5');

  const chartData = {
    labels,
    datasets: [
      {
        data: amounts,
        backgroundColor: colors,
        borderColor: '#0A1929',
        borderWidth: 2,
        hoverOffset: 10
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: window.innerWidth < 768 ? 'bottom' : 'bottom',
        labels: {
          color: '#B0BEC5',
          padding: window.innerWidth < 768 ? 10 : 15,
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: '#1E3A5F',
        titleColor: '#FFFFFF',
        bodyColor: '#B0BEC5',
        borderColor: '#00D9FF',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="h-full">
      <h3 className="text-lg font-semibold text-white mb-4">Expenses by Category</h3>
      <div className="h-[calc(100%-2rem)] flex items-center justify-center">
        {data.length > 0 ? (
          <Doughnut data={chartData} options={options} />
        ) : (
          <p className="text-text-secondary">No expense data available</p>
        )}
      </div>
    </div>
  );
};

export default CategoryBreakdown;
