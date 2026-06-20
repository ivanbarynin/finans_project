import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const AmortizationChart = ({ schedule }) => {
  if (!schedule || schedule.length === 0) return null;

  // Take every Nth month to reduce clutter (e.g., every 6 months for 20 year mortgage)
  const step = Math.ceil(schedule.length / 50);
  const chartData = schedule.filter((_, i) => i % step === 0);

  const data = {
    labels: chartData.map((item) => `Месяц ${item.month}`),
    datasets: [
      {
        label: 'Остаток',
        data: chartData.map((item) => item.remaining),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Процент',
        data: chartData.map((item) => item.interest || item.principal),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <h3 className="text-xl font-bold mb-4">График погашения</h3>
      <Line data={data} options={{ responsive: true }} />
    </div>
  );
};
