import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

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

const ExpenseChart = ({ data, title = 'Monthly Expenses' }) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const labels = data.map(item => `${monthNames[item.month - 1]} ${item.year}`);
  const amounts = data.map(item => item.totalAmount);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Total Amount',
        data: amounts,
        borderColor: '#00D9FF',
        backgroundColor: 'rgba(0, 217, 255, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#00D9FF',
        pointBorderColor: '#0A1929',
        pointBorderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1E3A5F',
        titleColor: '#FFFFFF',
        bodyColor: '#B0BEC5',
        borderColor: '#00D9FF',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `$${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 217, 255, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#B0BEC5',
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          },
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#B0BEC5',
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          },
          maxRotation: window.innerWidth < 768 ? 45 : 0,
          minRotation: window.innerWidth < 768 ? 45 : 0
        }
      }
    }
  };

  return (
    <div className="h-full">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="h-[calc(100%-2rem)]">
        {data.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-text-secondary">No expense data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseChart;
