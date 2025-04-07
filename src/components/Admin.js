import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Admin() {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState({});
  const [pendingRequests, setPendingRequests] = useState([]);
  const [portfolioInputs, setPortfolioInputs] = useState({});
  const [transactionInputs, setTransactionInputs] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showTransactions, setShowTransactions] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found. Redirecting to sign-in page...');
      setTimeout(() => (window.location.href = '/'), 2000);
      return;
    }
    axios
      .get('https://fundinar-server.onrender.com/api/user', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCurrentUser(res.data);
        fetchUsers();
        fetchPendingRequests();
      })
      .catch((err) => {
        console.error('Fetch current user error:', err.response || err);
        setError('Failed to retrieve user data. Redirecting to sign-in page...');
        setTimeout(() => (window.location.href = '/'), 2000);
      });
  }, []);

  const fetchUsers = () => {
    axios
      .get('https://fundinar-server.onrender.com/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((res) => setUsers(res.data.filter((u) => u.role !== 'fundManager')))
      .catch((err) => console.error('Fetch users error:', err.response || err));
  };

  const fetchPendingRequests = () => {
    axios
      .get('https://fundinar-server.onrender.com/api/pending-requests', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((res) => setPendingRequests(res.data))
      .catch((err) => console.error('Fetch pending requests error:', err.response || err));
  };

  const fetchTransactions = (userId) => {
    axios
      .get(`https://fundinar-server.onrender.com/api/transactions/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((res) => setTransactions((prev) => ({ ...prev, [userId]: res.data })))
      .catch((err) => console.error('Fetch transactions error:', err.response || err));
  };

  const handleApprove = (id) => {
    axios
      .post(`https://fundinar-server.onrender.com/api/users/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then(() => fetchUsers())
      .catch((err) => alert(err.response.data.message));
  };

  const handleDeny = (id) => {
    axios
      .post(`https://fundinar-server.onrender.com/api/users/${id}/deny`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then(() => fetchUsers())
      .catch((err) => alert(err.response.data.message));
  };

  const handleDelete = (id) => {
    axios
      .post(`https://fundinar-server.onrender.com/api/users/${id}/delete`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then(() => {
        fetchUsers();
        setDeleteConfirm(null);
      })
      .catch((err) => alert(err.response.data.message));
  };

  const handleUpdatePortfolio = (id) => {
    const portfolio = portfolioInputs[id] || 0;
    axios
      .post(`https://fundinar-server.onrender.com/api/users/${id}/portfolio`, { portfolio }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then(() => fetchUsers())
      .catch((err) => alert(err.response.data.message));
  };

  const handleUpdateTransaction = (txId, userId) => {
    const { amount, fee } = transactionInputs[txId] || { amount: 0, fee: 0 };
    axios
      .put(`https://fundinar-server.onrender.com/api/transactions/${txId}`, { amount, fee, status: 'processed' }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then(() => {
        fetchTransactions(userId);
        fetchPendingRequests();
      })
      .catch((err) => alert(err.response.data.message));
  };

  const handleDeleteTransaction = (txId, userId) => {
    axios
      .delete(`https://fundinar-server.onrender.com/api/transactions/${txId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then(() => {
        fetchTransactions(userId);
        fetchPendingRequests();
      })
      .catch((err) => alert(err.response.data.message));
  };

  const handleToggleTransactions = (userId) => {
    if (showTransactions[userId]) {
      setShowTransactions((prev) => ({ ...prev, [userId]: false }));
    } else {
      fetchTransactions(userId);
      setShowTransactions((prev) => ({ ...prev, [userId]: true }));
    }
  };

  const handleAddTransaction = (userId, type) => {
    axios
      .post(
        'https://fundinar-server.onrender.com/api/transactions',
        {
          userId,
          type,
          amount: 0,
          fee: 0,
          currency: 'USD',
          details: 'Added by Fund Manager',
          status: 'processed',
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      .then(() => fetchTransactions(userId))
      .catch((err) => alert(err.response.data.message));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  if (error) return <div className="text-red-400 text-center mt-10">{error}</div>;
  if (!currentUser) return <div className="text-white text-center mt-10">Loading user data...</div>;

  return (
    <div className="min-h-screen w-full max-w-5xl mx-auto text-white flex flex-col justify-between px-4 sm:px-6 lg:px-8">
      <div>
        <h2 className="text-3xl sm:text-4xl font-bold pulse-gradient-text text-center mt-10 mb-8">Fund Manager Dashboard</h2>

        <div className="card p-6 w-full max-w-2xl mx-auto mb-8">
          <h3 className="text-xl sm:text-2xl font-semibold text-center mb-4">Pending Requests</h3>
          <div className="space-y-4">
            {pendingRequests.length === 0 ? (
              <p className="text-center text-gray-400 text-sm sm:text-base">No pending requests at this time.</p>
            ) : (
              pendingRequests.map((req) => (
                <div key={req.id} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col gap-1 text-sm sm:text-base">
                      <span>{req.name} ({req.email})</span>
                      <span>{req.type} - {req.amount} {req.currency}</span>
                      <span>Details: {req.details}</span>
                      <span>Date: {req.date}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                      <input
                        type="number"
                        value={transactionInputs[req.id]?.amount || req.amount}
                        onChange={(e) =>
                          setTransactionInputs({
                            ...transactionInputs,
                            [req.id]: { ...transactionInputs[req.id], amount: e.target.value },
                          })
                        }
                        className="w-full sm:w-24 text-sm sm:text-base bg-gray-700 border border-gray-600 rounded-lg p-1"
                      />
                      <input
                        type="number"
                        value={transactionInputs[req.id]?.fee || req.fee}
                        onChange={(e) =>
                          setTransactionInputs({
                            ...transactionInputs,
                            [req.id]: { ...transactionInputs[req.id], fee: e.target.value },
                          })
                        }
                        className="w-full sm:w-20 text-sm sm:text-base bg-gray-700 border border-gray-600 rounded-lg p-1"
                      />
                      <button
                        onClick={() => handleUpdateTransaction(req.id, req.userId)}
                        className="px-4 py-2 bg-blue-600 rounded-lg text-sm sm:text-base w-full sm:w-auto"
                      >
                        Process
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(req.id, req.userId)}
                        className="px-4 py-2 bg-red-600 rounded-lg text-sm sm:text-base w-full sm:w-auto"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card p-6 w-full max-w-2xl mx-auto">
          <h3 className="text-xl sm:text-2xl font-semibold text-center mb-4">Pending User Accounts</h3>
          <div className="space-y-4">
            {users.filter((u) => u.status === 'pending').map((user) => (
              <div key={user.id} className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-800 rounded-lg gap-4">
                <div className="flex items-center gap-4 text-sm sm:text-base">
                  <img
                    src={user.profilePic ? `https://fundinar-server.onrender.com${user.profilePic}` : '/logo.png'}
                    alt={user.name}
                    className="rounded-full h-10 w-10 object-cover"
                  />
                  <span>{user.name} <span className="text-xs sm:text-sm text-gray-400">({user.email})</span></span>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                  <button onClick={() => handleApprove(user.id)} className="px-4 py-2 bg-purple-600 rounded-lg text-sm sm:text-base w-full sm:w-auto">Approve</button>
                  <button onClick={() => handleDeny(user.id)} className="px-4 py-2 bg-red-600 rounded-lg text-sm sm:text-base w-full sm:w-auto">Deny</button>
                </div>
              </div>
            ))}
          </div>
          <h3 className="text-xl sm:text-2xl mt-6 font-semibold text-center mb-4">Approved User Accounts</h3>
          <div className="space-y-4">
            {users.filter((u) => u.status === 'approved').map((user) => (
              <div key={user.id} className="p-4 bg-gray-800 rounded-lg">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4 text-sm sm:text-base">
                    <img
                      src={user.profilePic ? `https://fundinar-server.onrender.com${user.profilePic}` : '/logo.png'}
                      alt={user.name}
                      className="rounded-full h-10 w-10 object-cover"
                    />
                    <span>{user.name} <span className="text-xs sm:text-sm text-gray-400">({user.email})</span></span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto flex-wrap justify-center">
                    <input
                      type="text"
                      value={portfolioInputs[user.id] !== undefined ? portfolioInputs[user.id] : user.portfolio}
                      onChange={(e) => setPortfolioInputs({ ...portfolioInputs, [user.id]: e.target.value })}
                      className="w-full sm:w-32 text-sm sm:text-base bg-gray-700 border border-gray-600 rounded-lg p-2"
                      placeholder="Portfolio Value"
                    />
                    <button onClick={() => handleUpdatePortfolio(user.id)} className="px-4 py-2 bg-blue-600 rounded-lg text-sm sm:text-base w-full sm:w-auto">Update</button>
                    <button onClick={() => handleToggleTransactions(user.id)} className="px-4 py-2 bg-blue-600 rounded-lg text-sm sm:text-base w-full sm:w-auto">
                      {showTransactions[user.id] ? 'Hide Transactions' : 'View Transactions'}
                    </button>
                    <button onClick={() => setDeleteConfirm(user.id)} className="px-4 py-2 bg-red-600 rounded-lg text-sm sm:text-base w-full sm:w-auto">Delete</button>
                  </div>
                </div>
                {deleteConfirm === user.id && (
                  <div className="mt-2 text-center">
                    <p className="text-red-400 text-sm sm:text-base">Are you certain you wish to delete {user.name}’s account?</p>
                    <button onClick={() => handleDelete(user.id)} className="px-4 py-2 bg-red-600 rounded-lg text-sm sm:text-base mt-2 mr-2 w-full sm:w-auto">Yes</button>
                    <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 bg-gray-600 rounded-lg text-sm sm:text-base mt-2 w-full sm:w-auto">No</button>
                  </div>
                )}
                {showTransactions[user.id] && transactions[user.id] && (
                  <div className="mt-4">
                    <h4 className="text-base sm:text-lg font-semibold">Transaction History</h4>
                    <div className="mt-2 space-y-2">
                      {transactions[user.id].map((tx) => (
                        <div key={tx.id} className="flex flex-col sm:flex-row justify-between items-center p-2 bg-gray-900 rounded-lg gap-4">
                          <span className="text-sm sm:text-base">{tx.type} - {tx.date} {tx.status === 'pending' ? '(Pending)' : ''}</span>
                          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                            <div>
                              <label className="text-xs sm:text-sm">Amount:</label>
                              <input
                                type="number"
                                value={transactionInputs[tx.id]?.amount || tx.amount}
                                onChange={(e) =>
                                  setTransactionInputs({
                                    ...transactionInputs,
                                    [tx.id]: { ...transactionInputs[tx.id], amount: e.target.value },
                                  })
                                }
                                className="w-full sm:w-24 text-sm sm:text-base bg-gray-700 rounded-lg p-1"
                              />
                            </div>
                            <div>
                              <label className="text-xs sm:text-sm">Fee:</label>
                              <input
                                type="number"
                                value={transactionInputs[tx.id]?.fee || tx.fee}
                                onChange={(e) =>
                                  setTransactionInputs({
                                    ...transactionInputs,
                                    [tx.id]: { ...transactionInputs[tx.id], fee: e.target.value },
                                  })
                                }
                                className="w-full sm:w-20 text-sm sm:text-base bg-gray-700 rounded-lg p-1"
                              />
                            </div>
                            <button
                              onClick={() => handleUpdateTransaction(tx.id, user.id)}
                              className="px-2 py-1 bg-blue-600 rounded-lg text-xs sm:text-sm w-full sm:w-auto"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => handleDeleteTransaction(tx.id, user.id)}
                              className="px-2 py-1 bg-red-600 rounded-lg text-xs sm:text-sm w-full sm:w-auto"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="mt-4 flex flex-wrap justify-center gap-4">
                        <button onClick={() => handleAddTransaction(user.id, 'Deposit')} className="px-4 py-2 bg-green-600 rounded-lg text-sm sm:text-base w-full sm:w-auto">Add Deposit</button>
                        <button onClick={() => handleAddTransaction(user.id, 'Withdrawal')} className="px-4 py-2 bg-red-600 rounded-lg text-sm sm:text-base w-full sm:w-auto">Add Withdrawal</button>
                        <button onClick={() => handleAddTransaction(user.id, 'Profit')} className="px-4 py-2 bg-blue-600 rounded-lg text-sm sm:text-base w-full sm:w-auto">Add Profit</button>
                        <button onClick={() => handleAddTransaction(user.id, 'Loss')} className="px-4 py-2 bg-purple-600 rounded-lg text-sm sm:text-base w-full sm:w-auto">Add Loss</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} className="bg-gray-700 px-6 py-3 rounded-lg text-lg sm:text-xl mt-8 mx-auto block w-full sm:w-auto">Logout</button>
      </div>
      <footer className="mt-10 text-center text-sm sm:text-base">
        <p>© 2025 Fundinar.vip All rights reserved</p>
        <p className="mt-2">Fundinar.vip has been developed and is managed by Ahmed Kallel</p>
      </footer>
    </div>
  );
}

export default Admin;