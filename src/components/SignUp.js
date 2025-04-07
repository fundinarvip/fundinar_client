import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Link } from 'react-router-dom';

function SignUp() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post('https://fundinar-server.onrender.com/api/signup', { email, password, name })
      .then((res) => {
        setMessage(res.data.message);
        setError('');
      })
      .catch((err) => {
        setError(err.response?.data?.message || t('signUpError'));
        setMessage('');
        console.error('Sign-up error:', err);
      });
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
        <div className="flex justify-center min-h-[80px] mb-2">
          <h1 className="text-3xl sm:text-4xl font-bold pulse-gradient-text text-center leading-[1.5] max-w-[90%] px-4">{t('signUp')}</h1>
        </div>
        <div className="card p-6 w-full max-w-md mx-auto bg-gray-800 border border-gray-700">
          {message && <p className="text-green-400 text-center mb-4 leading-normal">{message}</p>}
          {error && <p className="text-red-400 text-center mb-4 leading-normal">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-lg sm:text-xl text-gray-300 mb-2 leading-normal">{t('Name')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('namePlaceholder')}
                className="w-full p-2 text-lg sm:text-xl bg-gray-700 rounded-lg text-white border border-gray-600"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-lg sm:text-xl text-gray-300 mb-2 leading-normal">{t('Email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                className="w-full p-2 text-lg sm:text-xl bg-gray-700 rounded-lg text-white border border-gray-600"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-lg sm:text-xl text-gray-300 mb-2 leading-normal">{t('Password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder')}
                className="w-full p-2 text-lg sm:text-xl bg-gray-700 rounded-lg text-white border border-gray-600"
                required
              />
            </div>
            <button type="submit" className="pulse-gradient-bg w-full py-2 rounded-lg text-lg sm:text-xl text-white">{t('signUp')}</button>
          </form>
          <p className="mt-4 text-center text-sm sm:text-base text-gray-400 leading-normal">
            <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300 mr-2">{t('forgotPassword')}</Link> |
            <Link to="/signin" className="text-blue-400 hover:text-blue-300 mx-2">{t('signIn')}</Link> |
            <Link to="/" className="text-blue-400 hover:text-blue-300 ml-2">{t('backToHome')}</Link>
          </p>
        </div>
      </div>
      <footer className="mt-10 text-center text-sm sm:text-base text-gray-400 leading-normal">
        <p>{t('footerRights')}</p>
        <p className="mt-2">Fundinar.vip has been developed and is managed by Ahmed Kallel</p>
      </footer>
    </div>
  );
}

export default SignUp;