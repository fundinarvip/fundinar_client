import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip } from 'chart.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

function User() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [chartTimeframe, setChartTimeframe] = useState('monthly');
  const [currency, setCurrency] = useState('USD');
  const [baseBalance, setBaseBalance] = useState(0);
  const [displayBalance, setDisplayBalance] = useState(0);
  const [showDepositFunds, setShowDepositFunds] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawCurrency, setWithdrawCurrency] = useState('');
  const [withdrawNetwork, setWithdrawNetwork] = useState('');
  const [withdrawDetails, setWithdrawDetails] = useState('');
  const [withdrawMessage, setWithdrawMessage] = useState('');
  const [withdrawMessageType, setWithdrawMessageType] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMessage, setDepositMessage] = useState('');
  const [depositMessageType, setDepositMessageType] = useState('');
  const [fundCurrency, setFundCurrency] = useState('');
  const [depositNetwork, setDepositNetwork] = useState('');
  const [showMoreDepositCurrencies, setShowMoreDepositCurrencies] = useState(false);
  const [showMoreWithdrawCurrencies, setShowMoreWithdrawCurrencies] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], data: [], performance: 0 });
  const [copyMessage, setCopyMessage] = useState('');
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError] = useState(null);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);

  const fetchTransactions = useCallback((userId) => {
    axios
      .get(`http://localhost:5000/api/transactions/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((res) => {
        const reversedTxs = res.data.reverse();
        setTransactions(reversedTxs);
        updateChartData(reversedTxs, chartTimeframe);
      })
      .catch((err) => console.error('Fetch transactions error:', err.response || err));
  }, [chartTimeframe]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError(t('noToken'));
      setTimeout(() => navigate('/signin'), 2000);
      return;
    }
    axios
      .get('http://localhost:5000/api/user', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        setBaseBalance(res.data.portfolio);
        setDisplayBalance(res.data.portfolio);
        fetchTransactions(res.data.id);
        setShowUpload(!res.data.profilePic);
        setShowProfilePrompt(!res.data.profilePic);
      })
      .catch((err) => {
        console.error('Fetch user error:', err.response || err);
        setError(t('fetchError'));
        setTimeout(() => navigate('/signin'), 2000);
      });
  }, [t, navigate, fetchTransactions]);

  const updateChartData = (txs, timeframe) => {
    let labels = [];
    let data = [];
    let performance = 0;
    let balanceHistory = [];
    let currentBalance = 0;
    let initialDeposits = 0;

    txs.forEach((tx) => {
      if (tx.status === 'processed') {
        if (tx.type === 'Deposit') {
          currentBalance += tx.amount;
          initialDeposits += tx.amount;
        } else if (tx.type === 'Profit') {
          currentBalance += tx.amount;
        } else if (tx.type === 'Withdrawal' || tx.type === 'Loss') {
          currentBalance -= tx.amount;
        }
        balanceHistory.push({ date: tx.date, balance: currentBalance });
      }
    });

    if (balanceHistory.length > 0 && initialDeposits > 0) {
      const finalBalance = balanceHistory[balanceHistory.length - 1].balance;
      performance = ((finalBalance - initialDeposits) / initialDeposits) * 100;
    }

    switch (timeframe) {
      case 'daily':
        labels = balanceHistory.slice(-4).map((h) => h.date.slice(-2));
        data = balanceHistory.slice(-4).map((h) => h.balance);
        break;
      case 'weekly':
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        data = Array(4).fill(0).map((_, i) => balanceHistory[Math.min(i * 7, balanceHistory.length - 1)]?.balance || 0);
        break;
      case 'monthly':
        labels = balanceHistory.slice(-4).map((h) => h.date.slice(5, 7));
        data = balanceHistory.slice(-4).map((h) => h.balance);
        break;
      case 'all':
        labels = balanceHistory.map((h) => h.date.slice(0, 4));
        data = balanceHistory.map((h) => h.balance);
        break;
      default:
        break;
    }

    setChartData({ labels, data, performance: performance.toFixed(2) });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  const updateBalance = (newCurrency) => {
    if (newCurrency === 'TND') setDisplayBalance(baseBalance * 3.07);
    else setDisplayBalance(baseBalance);
    setCurrency(newCurrency);
  };

  const handleDepositFunds = () => {
    setShowDepositFunds(!showDepositFunds);
    setShowWithdrawal(false);
    setShowHistory(false);
    setDepositMessage('');
  };

  const handleWithdrawal = () => {
    setShowWithdrawal(!showWithdrawal);
    setShowDepositFunds(false);
    setShowHistory(false);
    setWithdrawMessage('');
  };

  const handleHistory = () => {
    setShowHistory(!showHistory);
    setShowDepositFunds(false);
    setShowWithdrawal(false);
    setDepositMessage('');
    setWithdrawMessage('');
  };

  const submitWithdrawal = () => {
    const details = withdrawCurrency === 'CRYPTO' ? `${withdrawDetails} (Network: ${withdrawNetwork})` : withdrawDetails;
    axios
      .post(
        'http://localhost:5000/api/transactions',
        {
          userId: user.id,
          type: 'Withdrawal',
          amount: parseFloat(withdrawAmount),
          fee: 0,
          currency: withdrawCurrency,
          details,
          status: 'pending',
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      .then(() => {
        setWithdrawMessage(t('withdrawRecorded'));
        setWithdrawMessageType('success');
        fetchTransactions(user.id);
        setWithdrawAmount('');
        setWithdrawDetails('');
        setWithdrawNetwork('');
        setWithdrawCurrency('');
      })
      .catch((err) => {
        setWithdrawMessage(err.response?.data?.message || t('withdrawFailed'));
        setWithdrawMessageType('error');
      });
  };

  const submitDeposit = () => {
    const details = fundCurrency === 'CRYPTO' ? `${t('depositDetails')} ${fundCurrency} (Network: ${depositNetwork})` : `${t('depositDetails')} ${fundCurrency}`;
    axios
      .post(
        'http://localhost:5000/api/transactions',
        {
          userId: user.id,
          type: 'Deposit',
          amount: parseFloat(depositAmount),
          fee: 0,
          currency: fundCurrency,
          details,
          status: 'pending',
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      .then(() => {
        setDepositMessage(t('depositSubmitted'));
        setDepositMessageType('success');
        fetchTransactions(user.id);
        setDepositAmount('');
        setFundCurrency('');
        setDepositNetwork('');
      })
      .catch((err) => {
        setDepositMessage(err.response?.data?.message || t('depositFailed'));
        setDepositMessageType('error');
      });
  };

  const handleProfilePicUpload = () => {
    const formData = new FormData();
    formData.append('profilePic', profilePicFile);
    axios
      .post('http://localhost:5000/api/users/profile-pic', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        setUser((prev) => ({ ...prev, profilePic: res.data.profilePic }));
        setProfilePicFile(null);
        setShowUpload(false);
        setShowProfilePrompt(false);
        setDepositMessage(res.data.message);
        setDepositMessageType('success');
      })
      .catch((err) => {
        setDepositMessage(err.response?.data?.message || t('uploadFailed'));
        setDepositMessageType('error');
      });
  };

  const toggleUpload = () => setShowUpload(!showUpload);

  const handleTimeframeChange = (timeframe) => {
    setChartTimeframe(timeframe);
    updateChartData(transactions, timeframe);
  };

  const copyToClipboard = (id) => {
    const text = document.getElementById(id).innerText;
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopyMessage(t('copied'));
        setTimeout(() => setCopyMessage(''), 2000);
      })
      .catch((err) => console.error('Copy failed:', err));
  };

  if (error) return <div className="text-red-400 text-center mt-10 leading-normal">{error}</div>;
  if (!user) return <div className="text-white text-center mt-10 leading-normal">{t('loading')}</div>;

  return (
    <div className="min-h-screen w-full max-w-5xl mx-auto text-white flex flex-col justify-between px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div>
        <select
          className="mt-6 mb-8 mx-auto block w-full max-w-xs text-lg shadow-lg bg-gray-800 text-white rounded-lg p-2 border border-gray-600 text-center"
          onChange={(e) => {
            i18n.changeLanguage(e.target.value);
            updateBalance(e.target.value === 'ar' ? 'TND' : 'USD');
          }}
        >
          <option value="en">English</option>
          <option value="ar">العربية</option>
          <option value="fr">Français</option>
        </select>
        <div className="flex flex-col items-center space-y-4 card p-6 w-full max-w-md mx-auto">
          <img
            src={user.profilePic ? `http://localhost:5000${user.profilePic}` : '/logo.png'}
            alt="Profile"
            className="rounded-full h-20 w-20 object-cover cursor-pointer border-2 border-teal-500"
            onClick={toggleUpload}
          />
          <h2 className="text-2xl sm:text-3xl font-semibold text-teal-400 leading-normal">{user.name}</h2>
          {showProfilePrompt && !user.profilePic && (
            <p className="text-sm text-gray-400 leading-normal">{t('uploadProfilePrompt')}</p>
          )}
          {showUpload && (
            <div className="w-full">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfilePicFile(e.target.files[0])}
                className="text-sm text-gray-400 w-full mb-2 bg-gray-800 rounded-lg p-2"
              />
              {profilePicFile && (
                <button
                  onClick={handleProfilePicUpload}
                  className="pulse-gradient-bg px-4 py-2 rounded-lg text-sm font-semibold w-full text-white"
                >
                  {t('uploadPicture')}
                </button>
              )}
            </div>
          )}
        </div>
        <div className="mt-8 card p-6 w-full max-w-md mx-auto text-center bg-gray-800 border border-gray-700">
          <p className="text-lg sm:text-xl text-gray-300 leading-normal">{t('portfolioBalance')}</p>
          <div className="flex flex-col items-center gap-4 mt-2">
            <select
              value={currency}
              onChange={(e) => updateBalance(e.target.value)}
              className="bg-gray-700 p-2 rounded-lg text-lg sm:text-xl border border-gray-600 w-full max-w-xs text-white text-center"
            >
              <option value="USD">USD 🇺🇸</option>
              <option value="TND">TND 🇹🇳</option>
            </select>
            <span className="text-lg sm:text-xl text-teal-400 leading-normal">{displayBalance.toLocaleString()} {currency}</span>
          </div>
          <p className="text-lg sm:text-xl mt-4 text-gray-300 leading-normal">{t('portfolioPerformance')}: <span className="text-teal-400">{chartData.performance > 0 ? '+' : ''}{chartData.performance}%</span></p>
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
                labels: chartData.labels.length ? chartData.labels : ['No Data'],
                datasets: [
                  {
                    label: t('portfolioPerformance'),
                    data: chartData.data.length ? chartData.data : [0],
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
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={handleDepositFunds} className="pulse-gradient-bg px-6 py-3 rounded-lg text-lg sm:text-xl font-semibold w-full sm:w-auto text-white">{t('depositFunds')}</button>
          <button onClick={handleWithdrawal} className="pulse-gradient-bg px-6 py-3 rounded-lg text-lg sm:text-xl font-semibold w-full sm:w-auto text-white">{t('requestWithdrawal')}</button>
        </div>
        {showDepositFunds && (
          <div className="mt-6 card p-6 w-full max-w-md mx-auto text-center bg-gray-800 border border-gray-700">
            <h3 className="text-xl sm:text-2xl font-semibold text-teal-400 mb-4 leading-normal">{t('depositFunds')}</h3>
            {depositMessage && (
              <p className={`text-center mb-4 text-lg sm:text-xl ${depositMessageType === 'error' ? 'text-red-400' : 'text-green-400'} leading-normal`}>
                {depositMessage}
              </p>
            )}
            <form onSubmit={(e) => { e.preventDefault(); submitDeposit(); }}>
              <div className="flex flex-col gap-4 mb-4">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder={t('enterAmount')}
                  className="w-full text-lg sm:text-xl bg-gray-700 rounded-lg p-2 text-white border border-gray-600"
                  required
                />
                <select
                  value={fundCurrency}
                  onChange={(e) => setFundCurrency(e.target.value)}
                  className="w-full text-lg sm:text-xl bg-gray-700 rounded-lg p-2 text-white border border-gray-600"
                  required
                >
                  <option value="">{t('selectCurrency')}</option>
                  <option value="CRYPTO">CRYPTO (USDT, USDC, etc.) ₿</option>
                  <option value="TND">TND 🇹🇳</option>
                  <option value="EUR">EUR 🇪🇺</option>
                  <option value="USD">USD 🇺🇸</option>
                  {showMoreDepositCurrencies && (
                    <>
                      <option value="AED">AED 🇦🇪</option>
                      <option value="AUD">AUD 🇦🇺</option>
                      <option value="CAD">CAD 🇨🇦</option>
                      <option value="GBP">GBP 🇬🇧</option>
                      <option value="HUF">HUF 🇭🇺</option>
                      <option value="NZD">NZD 🇳🇿</option>
                      <option value="SGD">SGD 🇸🇬</option>
                      <option value="TRY">TRY 🇹🇷</option>
                    </>
                  )}
                </select>
                {fundCurrency === 'CRYPTO' && (
                  <select
                    value={depositNetwork}
                    onChange={(e) => setDepositNetwork(e.target.value)}
                    className="w-full text-lg sm:text-xl bg-gray-700 rounded-lg p-2 text-white border border-gray-600"
                    required
                  >
                    <option value="">{t('selectNetwork')}</option>
                    <option value="Pulsechain">Pulsechain</option>
                    <option value="Ethereum">Ethereum</option>
                    <option value="Base">Base</option>
                    <option value="BNB Chain">BNB Chain</option>
                    <option value="Optimism">Optimism</option>
                    <option value="Arbitrum One">Arbitrum One</option>
                    <option value="Cronos">Cronos</option>
                    <option value="Polygon">Polygon</option>
                  </select>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowMoreDepositCurrencies(!showMoreDepositCurrencies)}
                className="text-blue-400 text-lg sm:text-xl mb-4 hover:text-blue-300 transition leading-normal"
              >
                {showMoreDepositCurrencies ? t('hideCurrencies') : t('moreCurrencies')}
              </button>
              <div className="text-sm sm:text-lg text-gray-300 leading-normal">
                {fundCurrency === 'CRYPTO' && (
                  <div>
                    <p>{t('address')}: <span id="cryptoAddress">0xD85083194038Cb1528C22bC57100b12Af01fa69D</span> <button type="button" onClick={() => copyToClipboard('cryptoAddress')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                  </div>
                )}
                {fundCurrency === 'TND' && (
                  <div>
                    <p>{t('name')}: <span id="tndName">Ahmed Kallel</span> <button type="button" onClick={() => copyToClipboard('tndName')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>IBAN: <span id="tndIban">04037123007623724774</span> <button type="button" onClick={() => copyToClipboard('tndIban')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>Bank: <span id="tndBank">Attijari Bank</span> <button type="button" onClick={() => copyToClipboard('tndBank')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                  </div>
                )}
                {fundCurrency === 'EUR' && (
                  <div>
                    <p>{t('name')}: <span id="eurName">Ahmed Kallel</span> <button type="button" onClick={() => copyToClipboard('eurName')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>IBAN: <span id="eurIban">BE60967029149270</span> <button type="button" onClick={() => copyToClipboard('eurIban')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>SWIFT/BIC: <span id="eurSwift">TRWIBEB1XXX</span> <button type="button" onClick={() => copyToClipboard('eurSwift')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>Bank: <span id="eurBank">Wise, Rue du Trône 100, 3rd floor, Brussels, 1050, Belgium</span> <button type="button" onClick={() => copyToClipboard('eurBank')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                  </div>
                )}
                {fundCurrency === 'USD' && (
                  <div>
                    <p>{t('name')}: <span id="usdName">Ahmed Kallel</span> <button type="button" onClick={() => copyToClipboard('usdName')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>Account: <span id="usdAccount">8312017912</span> <button type="button" onClick={() => copyToClipboard('usdAccount')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>Type: <span id="usdType">Checking</span> <button type="button" onClick={() => copyToClipboard('usdType')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>Routing (Wire/ACH): <span id="usdRouting">026073150</span> <button type="button" onClick={() => copyToClipboard('usdRouting')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>SWIFT/BIC: <span id="usdSwift">CMFGUS33</span> <button type="button" onClick={() => copyToClipboard('usdSwift')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>Bank: <span id="usdBank">Community Federal Savings Bank, 89-16 Jamaica Ave, Woodhaven, NY, 11421, United States</span> <button type="button" onClick={() => copyToClipboard('usdBank')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                  </div>
                )}
                {fundCurrency === 'AED' && (
                  <div>
                    <p>{t('name')}: <span id="aedName">Ahmed Kallel</span> <button type="button" onClick={() => copyToClipboard('aedName')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>Account: <span id="aedAccount">1015790138601</span> <button type="button" onClick={() => copyToClipboard('aedAccount')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>IBAN: <span id="aedIban">AE190260001015790138601</span> <button type="button" onClick={() => copyToClipboard('aedIban')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>SWIFT: <span id="aedSwift">EBILAEAD</span> <button type="button" onClick={() => copyToClipboard('aedSwift')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>Routing: <span id="aedRouting">202620103</span> <button type="button" onClick={() => copyToClipboard('aedRouting')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>Bank: <span id="aedBank">Emirates NBD</span> <button type="button" onClick={() => copyToClipboard('aedBank')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                  </div>
                )}
                {fundCurrency === 'AUD' && (
                  <div>
                    <p>{t('name')}: <span id="audName">Ahmed Kallel</span> <button type="button" onClick={() => copyToClipboard('audName')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>Account: <span id="audAccount">211367161</span> <button type="button" onClick={() => copyToClipboard('audAccount')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>BSB: <span id="audBsb">774001</span> <button type="button" onClick={() => copyToClipboard('audBsb')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>SWIFT/BIC: <span id="audSwift">TRWIAUS1XXX</span> <button type="button" onClick={() => copyToClipboard('audSwift')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>Bank: <span id="audBank">Wise Australia Pty Ltd, Suite 1, Level 11, 66 Goulburn Street, Sydney, NSW, 2000, Australia</span> <button type="button" onClick={() => copyToClipboard('audBank')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                  </div>
                )}
                {fundCurrency === 'CAD' && (
                  <div>
                    <p>{t('name')}: <span id="cadName">Ahmed Kallel</span> <button type="button" onClick={() => copyToClipboard('cadName')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>Account: <span id="cadAccount">200110241675</span> <button type="button" onClick={() => copyToClipboard('cadAccount')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>Institution: <span id="cadInstitution">621</span> <button type="button" onClick={() => copyToClipboard('cadInstitution')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>Transit: <span id="cadTransit">16001</span> <button type="button" onClick={() => copyToClipboard('cadTransit')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>SWIFT/BIC: <span id="cadSwift">TRWICAW1XXX</span> <button type="button" onClick={() => copyToClipboard('cadSwift')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>Bank: <span id="cadBank">Wise Payments Canada Inc., 99 Bank Street, Suite 1420, Ottawa, ON, K1P 1H4, Canada</span> <button type="button" onClick={() => copyToClipboard('cadBank')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                  </div>
                )}
                {fundCurrency === 'GBP' && (
                  <div>
                    <p>{t('name')}: <span id="gbpName">Ahmed Kallel</span> <button type="button" onClick={() => copyToClipboard('gbpName')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>Account: <span id="gbpAccount">97670808</span> <button type="button" onClick={() => copyToClipboard('gbpAccount')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>Sort Code: <span id="gbpSort">231470</span> <button type="button" onClick={() => copyToClipboard('gbpSort')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>IBAN: <span id="gbpIban">GB19TRWI23147097670808</span> <button type="button" onClick={() => copyToClipboard('gbpIban')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>SWIFT/BIC: <span id="gbpSwift">TRWIGB2LXXX</span> <button type="button" onClick={() => copyToClipboard('gbpSwift')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>Bank: <span id="gbpBank">Wise Payments Limited, 1st Floor, Worship Square, 65 Clifton Street, London, EC2A 4JE, United Kingdom</span> <button type="button" onClick={() => copyToClipboard('gbpBank')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                  </div>
                )}
                {fundCurrency === 'HUF' && (
                  <div>
                    <p>{t('name')}: <span id="hufName">Ahmed Kallel</span> <button type="button" onClick={() => copyToClipboard('hufName')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>Account: <span id="hufAccount">126000161169519317132357</span> <button type="button" onClick={() => copyToClipboard('hufAccount')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>IBAN: <span id="hufIban">HU29126000161169519317132357</span> <button type="button" onClick={() => copyToClipboard('hufIban')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>SWIFT/BIC: <span id="hufSwift">TRWIBEBBXXX</span> <button type="button" onClick={() => copyToClipboard('hufSwift')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>Bank: <span id="hufBank">Wise, Rue du Trône 100, 3rd floor, Brussels, 1050, Belgium</span> <button type="button" onClick={() => copyToClipboard('hufBank')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                  </div>
                )}
                {fundCurrency === 'NZD' && (
                  <div>
                    <p>{t('name')}: <span id="nzdName">Ahmed Kallel</span> <button type="button" onClick={() => copyToClipboard('nzdName')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>Account: <span id="nzdAccount">042021010173170</span> <button type="button" onClick={() => copyToClipboard('nzdAccount')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>SWIFT/BIC: <span id="nzdSwift">TRWINZ21XXX</span> <button type="button" onClick={() => copyToClipboard('nzdSwift')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>Bank: <span id="nzdBank">Wise Payments Ltd. - New Zealand Branch, 1st Floor, Worship Square, 65 Clifton Street, London, EC2A 4JE, United Kingdom</span> <button type="button" onClick={() => copyToClipboard('nzdBank')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                  </div>
                )}
                {fundCurrency === 'SGD' && (
                  <div>
                    <p>{t('name')}: <span id="sgdName">Ahmed Kallel</span> <button type="button" onClick={() => copyToClipboard('sgdName')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>Account: <span id="sgdAccount">3942695</span> <button type="button" onClick={() => copyToClipboard('sgdAccount')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>Bank Code: <span id="sgdBankCode">0516</span> <button type="button" onClick={() => copyToClipboard('sgdBankCode')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>SWIFT/BIC: <span id="sgdSwift">TRWISGSGXXX</span> <button type="button" onClick={() => copyToClipboard('sgdSwift')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>Bank: <span id="sgdBank">Wise Asia-Pacific Pte. Ltd., 2 Tanjong Katong Road, #07-01, PLQ3, Singapore, 437161, Singapore</span> <button type="button" onClick={() => copyToClipboard('sgdBank')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                  </div>
                )}
                {fundCurrency === 'TRY' && (
                  <div>
                    <p>{t('name')}: <span id="tryName">Ahmed Kallel</span> <button type="button" onClick={() => copyToClipboard('tryName')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                    <p>IBAN: <span id="tryIban">TR560010300000000043064312</span> <button type="button" onClick={() => copyToClipboard('tryIban')} className="ml-2 text-xs sm:text-sm bg-gray-700 px-2 py-1 rounded text-white">{t('copy')}</button></p>
                  </div>
                )}
              </div>
              {copyMessage && (
                <p className="text-center mt-4 text-lg sm:text-xl text-green-400 leading-normal">{copyMessage}</p>
              )}
              <button type="submit" className="pulse-gradient-bg w-full mt-4 text-lg sm:text-xl mx-auto block rounded-lg py-2 text-white">{t('submitRequest')}</button>
            </form>
            <p className="mt-4 text-sm sm:text-lg text-gray-400 leading-normal">{t('depositNote')}</p>
          </div>
        )}
        {showWithdrawal && (
          <div className="mt-6 card p-6 w-full max-w-md mx-auto text-center bg-gray-800 border border-gray-700">
            <h3 className="text-xl sm:text-2xl font-semibold text-teal-400 mb-4 leading-normal">{t('requestWithdrawal')}</h3>
            {withdrawMessage && (
              <p className={`text-center mb-4 text-lg sm:text-xl ${withdrawMessageType === 'error' ? 'text-red-400' : 'text-green-400'} leading-normal`}>
                {withdrawMessage}
              </p>
            )}
            <div className="flex flex-col justify-center gap-4">
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder={t('enterAmount')}
                className="w-full text-lg sm:text-xl bg-gray-700 rounded-lg p-2 text-white border border-gray-600"
              />
              <select
                value={withdrawCurrency}
                onChange={(e) => setWithdrawCurrency(e.target.value)}
                className="w-full text-lg sm:text-xl bg-gray-700 rounded-lg p-2 text-white border border-gray-600"
              >
                <option value="">{t('selectCurrency')}</option>
                <option value="CRYPTO">CRYPTO (USDT, USDC, etc.) ₿</option>
                <option value="TND">TND 🇹🇳</option>
                <option value="EUR">EUR 🇪🇺</option>
                <option value="USD">USD 🇺🇸</option>
                {showMoreWithdrawCurrencies && (
                  <>
                    <option value="AED">AED 🇦🇪</option>
                    <option value="AUD">AUD 🇦🇺</option>
                    <option value="CAD">CAD 🇨🇦</option>
                    <option value="GBP">GBP 🇬🇧</option>
                    <option value="HUF">HUF 🇭🇺</option>
                    <option value="NZD">NZD 🇳🇿</option>
                    <option value="SGD">SGD 🇸🇬</option>
                    <option value="TRY">TRY 🇹🇷</option>
                  </>
                )}
              </select>
              {withdrawCurrency === 'CRYPTO' && (
                <select
                  value={withdrawNetwork}
                  onChange={(e) => setWithdrawNetwork(e.target.value)}
                  className="w-full text-lg sm:text-xl bg-gray-700 rounded-lg p-2 text-white border border-gray-600"
                >
                  <option value="">{t('selectNetwork')}</option>
                  <option className="Pulsechain">Pulsechain</option>
                  <option value="Ethereum">Ethereum</option>
                  <option value="Base">Base</option>
                  <option value="BNB Chain">BNB Chain</option>
                  <option value="Optimism">Optimism</option>
                  <option value="Arbitrum One">Arbitrum One</option>
                  <option value="Cronos">Cronos</option>
                  <option value="Polygon">Polygon</option>
                </select>
              )}
            </div>
            <button
              onClick={() => setShowMoreWithdrawCurrencies(!showMoreWithdrawCurrencies)}
              className="text-blue-400 text-lg sm:text-xl mt-4 mb-4 hover:text-blue-300 transition leading-normal"
            >
              {showMoreWithdrawCurrencies ? t('hideCurrencies') : t('moreCurrencies')}
            </button>
            <textarea
              value={withdrawDetails}
              onChange={(e) => setWithdrawDetails(e.target.value)}
              placeholder={withdrawCurrency === 'CRYPTO' ? t('enterCryptoAddress') : t('enterBankDetails')}
              className="mt-4 w-full h-24 text-lg sm:text-xl bg-gray-700 rounded-lg p-2 text-white border border-gray-600"
            />
            <button onClick={submitWithdrawal} className="pulse-gradient-bg w-full mt-4 text-lg sm:text-xl mx-auto block rounded-lg py-2 text-white">{t('submitRequest')}</button>
            <p className="mt-4 text-sm sm:text-lg text-gray-400 leading-normal">{t('withdrawNote')}</p>
          </div>
        )}
        <div className="mt-6 flex justify-center">
          <button onClick={handleHistory} className="pulse-gradient-bg px-6 py-3 rounded-lg text-lg sm:text-xl w-full sm:w-auto text-white">{t('viewTransactionHistory')}</button>
        </div>
        {showHistory && (
          <div className="mt-6 card p-6 w-full max-w-lg mx-auto bg-gray-800 border border-gray-700">
            <h3 className="text-xl sm:text-2xl font-semibold text-teal-400 text-center mb-4 leading-normal">{t('transactionHistory')}</h3>
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className={`p-4 ${tx.type === 'Withdrawal' && tx.status === 'pending' ? 'bg-yellow-900' : tx.type === 'Withdrawal' || tx.type === 'Loss' ? 'bg-red-900' : 'bg-green-900'} rounded-lg`}>
                  <p className="text-sm sm:text-lg text-white leading-normal">{t(tx.type.toLowerCase())} - {tx.date} {tx.status === 'pending' ? `(${t('pending')})` : ''}</p>
                  <p className="text-white leading-normal">{t('amount')}: {tx.amount} {tx.currency.toUpperCase()} | {t('fee')}: {tx.fee} {tx.currency.toUpperCase()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="pulse-gradient-bg px-6 py-3 rounded-lg text-lg sm:text-xl mt-6 mx-auto block w-full sm:w-auto text-white">{t('logout')}</button>
      </div>
      <footer className="mt-10 text-center text-sm sm:text-base text-gray-400 leading-normal">
        <p>{t('footerRights')}</p>
        <p className="mt-2">Fundinar.vip has been developed and is managed by Ahmed Kallel</p>
      </footer>
    </div>
  );
}

export default User;