import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

const chartData = {
  daily: { labels: ['Mon', 'Tue', 'Wed', 'Thu'], data: [100, 101, 101.5, 102.3], performance: 2.3 },
  weekly: { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], data: [100, 105, 109, 111.5], performance: 11.5 },
  monthly: { labels: ['Jan', 'Feb', 'Mar', 'Apr'], data: [100, 115, 122, 126.1], performance: 26.1 },
  all: { labels: ['2022', '2023', '2024', '2025'], data: [100, 150, 200, 351.4], performance: 251.4 },
};

function Landing() {
  const { t, i18n } = useTranslation();
  const [chartTimeframe, setChartTimeframe] = useState('monthly');
  const [performance, setPerformance] = useState(chartData.monthly.performance);

  const handleTimeframeChange = (timeframe) => {
    setChartTimeframe(timeframe);
    setPerformance(chartData[timeframe].performance);
  };

  return (
    <div className="min-h-screen w-full max-w-5xl mx-auto flex flex-col justify-between px-4 sm:px-6 lg:px-8 text-white bg-gray-900">
      <div>
        <div className="flex flex-col items-center mt-6 mb-8">
          <Link to="/" className="flex flex-col items-center">
            <img src="/logo.png" alt="Fundinar Logo" className="h-24 w-24 sm:h-32 sm:w-32 mb-2" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-normal">Fundinar.vip</h2>
          </Link>
          <select
            className="w-full max-w-xs text-lg shadow-lg bg-gray-800 text-white rounded-lg p-2 border border-gray-600 mt-4 text-center"
            onChange={(e) => i18n.changeLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
            <option value="fr">Français</option>
          </select>
        </div>
        <div className="flex justify-center min-h-[100px] mb-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold pulse-gradient-text text-center leading-[1.5] max-w-[90%] px-4">{t('welcome')}</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link to="/signin" className="pulse-gradient-bg px-6 py-3 rounded-lg text-lg sm:text-xl font-semibold w-full sm:w-auto text-center text-white">{t('signIn')}</Link>
          <Link to="/signup" className="pulse-gradient-bg px-6 py-3 rounded-lg text-lg sm:text-xl font-semibold w-full sm:w-auto text-center text-white">{t('signUp')}</Link>
        </div>
        <div className="card p-6 w-full max-w-md mx-auto bg-gray-800 border border-gray-700">
          <p className="text-lg sm:text-xl text-gray-300 text-center leading-normal">{t('portfolioPerformance')}: <span className="text-teal-400">+{performance}%</span></p>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {['daily', 'weekly', 'monthly', 'all'].map((time) => (
              <button
                key={time}
                onClick={() => handleTimeframeChange(time)}
                className="pulse-gradient-bg px-3 py-1 rounded text-lg w-full sm:w-auto text-white"
              >
                {t(time)}
              </button>
            ))}
          </div>
          <div className="mt-6 w-full h-[300px]">
            <Line
              data={{
                labels: chartData[chartTimeframe].labels,
                datasets: [
                  {
                    label: t('portfolioPerformance'),
                    data: chartData[chartTimeframe].data,
                    borderColor: '#A335F3',
                    backgroundColor: 'rgba(163, 53, 243, 0.2)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#A335F3',
                    pointRadius: 5,
                    pointHoverRadius: 8,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#d1d5db' } },
                  x: { grid: { display: false }, ticks: { color: '#d1d5db' } },
                },
                plugins: {
                  legend: { display: false },
                  tooltip: { backgroundColor: '#1f2937', titleColor: '#fff', bodyColor: '#fff' },
                },
                animation: { duration: 1500, easing: 'easeInOutQuart' },
              }}
              height={300}
              className="w-full"
            />
          </div>
        </div>
      </div>
      <footer className="mt-10 text-center text-sm sm:text-base text-gray-400 leading-normal">
        <p>{t('footerRights')}</p>
        <p className="mt-2">Fundinar.vip has been developed and is managed by Ahmed Kallel</p>
      </footer>
    </div>
  );
}

export default Landing;