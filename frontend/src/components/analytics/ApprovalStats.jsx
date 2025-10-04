import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ApprovalStats = ({ data }) => {
  const statusColors = {
    draft: '#B0BEC5',
    pending: '#FFB800',
    approved: '#00FF88',
    rejected: '#FF3366'
  };

  const statusLabels = {
    draft: 'Draft',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected'
  };

  const labels = data.statusBreakdown.map(item => statusLabels[item.status] || item.status);
  const counts = data.statusBreakdown.map(item => item.count);
  const colors = data.statusBreakdown.map(item => statusColors[item.status] || '#B0BEC5');

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Number of Expenses',
        data: counts,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 50
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
      tooltip: {
        backgroundColor: '#1E3A5F',
        titleColor: '#FFFFFF',
        bodyColor: '#B0BEC5',
        borderColor: '#00D9FF',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            const item = data.statusBreakdown[context.dataIndex];
            return [
              `Count: ${item.count}`,
              `Amount: $${item.totalAmount.toFixed(2)}`
            ];
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
          stepSize: 1,
          font: {
            size: window.innerWidth < 768 ? 10 : 12
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
          }
        }
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4">Approval Status</h3>
      <div className="flex-1 min-h-0">
        {data.statusBreakdown.length > 0 ? (
          <Bar data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-text-secondary">No approval data available</p>
          </div>
        )}
      </div>
      {data.approvalTime && (
        <div className="mt-4 pt-4 border-t border-accent/20 text-sm text-text-secondary">
          <p>Avg. Approval Time: {data.approvalTime.avgApprovalTimeHours.toFixed(1)} hours</p>
        </div>
      )}
    </div>
  );
};

export default ApprovalStats;
