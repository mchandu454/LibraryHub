// frontend/src/pages/user/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import api from '../../api';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';

// Helper to format dates
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function Dashboard() {
  const [user, setUser] = useState(null);
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [returning, setReturning] = useState({}); // { [borrowingId]: boolean }
  const [userLoading, setUserLoading] = useState(true);
  const [avgProgress, setAvgProgress] = useState(0);
  // Progress update states
  const [updatingProgress, setUpdatingProgress] = useState({}); // { [borrowingId]: boolean }
  const [progressForms, setProgressForms] = useState({}); // { [borrowingId]: { show: boolean, value: number } }
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      setUserLoading(true);
      try {
        const [userRes, borrowingsRes] = await Promise.all([
          api.get('/members/me'),
          api.get('/borrowings/history')
        ]);
        
        setUser(userRes.data.user);
        setBorrowings(borrowingsRes.data.borrowings || []);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data.');
      } finally {
        setLoading(false);
        setUserLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Calculate average progress
  useEffect(() => {
    if (borrowings.length === 0) {
      setAvgProgress(0);
    } else {
      const total = borrowings.reduce((sum, b) => sum + (b.progress || 0), 0);
      setAvgProgress(Math.round(total / borrowings.length));
    }
  }, [borrowings]);

  const handleReturn = async (borrowingId) => {
    setReturning(prev => ({ ...prev, [borrowingId]: true }));
    try {
      await api.put(`/borrowings/${borrowingId}/return`, {});
      toast.success('Book returned successfully!');
      // Refresh borrowings
      const res = await api.get('/borrowings/history');
      setBorrowings(res.data.borrowings || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to return book.');
    } finally {
      setReturning(prev => ({ ...prev, [borrowingId]: false }));
    }
  };

  // Handle progress update
  const handleProgressUpdate = async (borrowingId, newProgress) => {
    if (newProgress < 0 || newProgress > 100) {
      toast.error('Progress must be between 0 and 100.');
      return;
    }

    setUpdatingProgress(prev => ({ ...prev, [borrowingId]: true }));
    try {
      await api.post('/progress', {
        borrowingId,
        progress: newProgress
      });
      
      // Update local state
      setBorrowings(prev => prev.map(b => 
        b.id === borrowingId ? { ...b, progress: newProgress } : b
      ));
      
      // Hide progress form
      setProgressForms(prev => ({ ...prev, [borrowingId]: { show: false, value: 0 } }));
      toast.success(`Progress updated to ${newProgress}%!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update progress.');
    } finally {
      setUpdatingProgress(prev => ({ ...prev, [borrowingId]: false }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'borrowed':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'returned':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case 'overdue':
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'borrowed':
        return '📖 Currently Borrowed';
      case 'returned':
        return '✅ Returned';
      case 'overdue':
        return '⚠️ Overdue';
      default:
        return '❓ Unknown';
    }
  };

  const handleProfileUpdate = async (updatedData) => {
    try {
      const res = await api.put('/members/me', updatedData);

      // SET TOKEN AND AXIOS HEADER HERE IF BACKEND RETURNS NEW TOKEN
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      }
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user); // or update context/redux
      }
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Profile update failed!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-glass to-accent-teal pb-20 animate-fadeIn">
        <div className="max-w-6xl mx-auto px-4 pt-12 flex flex-col gap-10">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <div className="glass rounded-2xl shadow-glow p-6 flex flex-col items-center animate-pop">
              <span className="text-3xl text-accent-gold mb-2">📚</span>
              <div className="text-lg font-semibold text-primary-dark">Books Borrowed</div>
              <div className="text-3xl font-extrabold text-primary-dark mt-1">{borrowings.length}</div>
            </div>
            <div className="glass rounded-2xl shadow-glow p-6 flex flex-col items-center animate-pop">
              <span className="text-3xl text-accent-teal mb-2">⏳</span>
              <div className="text-lg font-semibold text-primary-dark">Currently Borrowed</div>
              <div className="text-3xl font-extrabold text-primary-dark mt-1">{borrowings.length}</div>
            </div>
            <div className="glass rounded-2xl shadow-glow p-6 flex flex-col items-center animate-pop">
              <span className="text-3xl text-accent-gold mb-2">📈</span>
              <div className="text-lg font-semibold text-primary-dark">Avg. Progress</div>
              <div className="text-3xl font-extrabold text-primary-dark mt-1">{avgProgress}%</div>
            </div>
          </div>
          {/* Current Borrowings */}
          <section>
            <h2 className="text-2xl font-bold text-primary-dark mb-4 flex items-center gap-2">
              <span className="text-accent-teal">📖</span> Current Borrowings
            </h2>
            {borrowings.length === 0 ? (
              <div className="text-gray-500">No active borrowings.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {borrowings.map(borrowing => (
                  <div key={borrowing.id} className="glass rounded-2xl shadow-card p-5 flex flex-col gap-3 animate-pop">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-24 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        {borrowing.book?.image || borrowing.book?.coverImage ? (
                          <img src={borrowing.book.image || borrowing.book.coverImage} alt={borrowing.book.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-400 text-lg">No Cover</span>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-1 line-clamp-2">{borrowing.book?.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-xs mb-1 line-clamp-1">by {borrowing.book?.author}</p>
                        <span className="inline-block px-2 py-1 text-xs bg-gradient-primary text-white rounded-full font-medium w-fit mb-1">{borrowing.book?.genre}</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Progress</span>
                        <span className="text-xs text-primary-dark font-bold">{borrowing.progress || 0}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-accent-teal transition-all duration-500" style={{ width: `${borrowing.progress || 0}%` }}></div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Last read: {borrowing.lastReadAt ? formatDate(borrowing.lastReadAt) : 'N/A'}</div>
                      
                      {/* Progress Update Form */}
                      {progressForms[borrowing.id]?.show ? (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={progressForms[borrowing.id].value}
                              onChange={(e) => setProgressForms(prev => ({
                                ...prev,
                                [borrowing.id]: { ...prev[borrowing.id], value: parseInt(e.target.value) }
                              }))}
                              className="flex-1"
                            />
                            <span className="text-xs font-bold text-primary-dark min-w-[2.5rem]">
                              {progressForms[borrowing.id].value}%
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleProgressUpdate(borrowing.id, progressForms[borrowing.id].value)}
                              disabled={updatingProgress[borrowing.id]}
                              className="flex-1 btn-accent py-1 rounded-lg text-xs font-semibold"
                            >
                              {updatingProgress[borrowing.id] ? 'Updating...' : 'Update'}
                            </button>
                            <button
                              onClick={() => setProgressForms(prev => ({ ...prev, [borrowing.id]: { show: false, value: 0 } }))}
                              className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setProgressForms(prev => ({ 
                            ...prev, 
                            [borrowing.id]: { show: true, value: borrowing.progress || 0 } 
                          }))}
                          className="w-full mt-2 btn-accent py-1 rounded-lg text-xs font-semibold"
                        >
                          📊 Update Progress
                        </button>
                      )}
                    </div>
                    {borrowing.status === 'borrowed' && (
                      <button
                        type="button"
                        aria-label="Return this book"
                        tabIndex={0}
                        className="btn-success px-4 py-2 rounded-xl font-semibold shadow-glow hover-lift transition-all duration-200"
                        onClick={() => {
                          console.log('Return clicked', borrowing.id);
                          handleReturn(borrowing.id);
                        }}
                        disabled={returning[borrowing.id]}
                      >
                        {returning[borrowing.id] ? 'Returning...' : 'Return'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
          {/* Borrow History Timeline */}
          <section>
            <h2 className="text-2xl font-bold text-primary-dark mb-4 flex items-center gap-2">
              <span className="text-accent-gold">🕑</span> Borrow History
            </h2>
            {borrowings.length === 0 ? (
              <div className="text-gray-500">No borrow history yet.</div>
            ) : (
              <div className="space-y-6">
                {borrowings.map(borrowing => (
                  <div key={borrowing.id} className="glass rounded-xl shadow-card p-4 flex flex-col sm:flex-row items-center gap-4 animate-fadeIn">
                    <div className="w-14 h-20 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      {borrowing.book?.image ? (
                        <img src={borrowing.book.image} alt={borrowing.book.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400 text-lg">No Cover</span>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <h3 className="font-bold text-base text-gray-800 dark:text-white mb-1 line-clamp-2">{borrowing.book?.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-xs mb-1 line-clamp-1">by {borrowing.book?.author}</p>
                      <span className="inline-block px-2 py-1 text-xs bg-gradient-primary text-white rounded-full font-medium w-fit mb-1">{borrowing.book?.genre}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${borrowing.status === 'returned' ? 'bg-green-100 text-green-800' : borrowing.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-accent-gold text-white'}`}>
                          {borrowing.status.charAt(0).toUpperCase() + borrowing.status.slice(1)}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(borrowing.borrowDate)}</span>
                      </div>
                    </div>
                    {borrowing.status === 'overdue' && (
                      <span className="ml-4 text-red-600 font-bold animate-pulse">Overdue!</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-8xl mb-6 animate-bounce">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Oops! Something went wrong</h2>
          <p className="text-red-500 text-lg mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-gradient-primary text-white rounded-xl hover-lift shadow-glow transition-all duration-200 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const activeBorrowings = borrowings.filter(b => b.status === 'borrowed');
  const returnedBorrowings = borrowings.filter(b => b.status === 'returned');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-glass to-accent-teal pb-20 animate-fadeIn">
      <div className="max-w-6xl mx-auto px-4 pt-12 flex flex-col gap-10">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          <div className="glass rounded-2xl shadow-glow p-6 flex flex-col items-center animate-pop">
            <span className="text-3xl text-accent-gold mb-2">📚</span>
            <div className="text-lg font-semibold text-primary-dark">Books Borrowed</div>
            <div className="text-3xl font-extrabold text-primary-dark mt-1">{borrowings.length}</div>
          </div>
          <div className="glass rounded-2xl shadow-glow p-6 flex flex-col items-center animate-pop">
            <span className="text-3xl text-accent-teal mb-2">⏳</span>
            <div className="text-lg font-semibold text-primary-dark">Currently Borrowed</div>
            <div className="text-3xl font-extrabold text-primary-dark mt-1">{activeBorrowings.length}</div>
          </div>
          <div className="glass rounded-2xl shadow-glow p-6 flex flex-col items-center animate-pop">
            <span className="text-3xl text-accent-gold mb-2">📈</span>
            <div className="text-lg font-semibold text-primary-dark">Avg. Progress</div>
            <div className="text-3xl font-extrabold text-primary-dark mt-1">{avgProgress}%</div>
          </div>
        </div>
        {/* Current Borrowings */}
        <section>
          <h2 className="text-2xl font-bold text-primary-dark mb-4 flex items-center gap-2">
            <span className="text-accent-teal">📖</span> Current Borrowings
          </h2>
          {activeBorrowings.length === 0 ? (
            <div className="text-gray-500">No active borrowings.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {activeBorrowings.map(borrowing => (
                <div key={borrowing.id} className="glass rounded-2xl shadow-card p-5 flex flex-col gap-3 animate-pop">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-24 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      {borrowing.book?.image ? (
                        <img src={borrowing.book.image} alt={borrowing.book.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400 text-lg">No Cover</span>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-1 line-clamp-2">{borrowing.book?.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-xs mb-1 line-clamp-1">by {borrowing.book?.author}</p>
                      <span className="inline-block px-2 py-1 text-xs bg-gradient-primary text-white rounded-full font-medium w-fit mb-1">{borrowing.book?.genre}</span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Progress</span>
                      <span className="text-xs text-primary-dark font-bold">{borrowing.progress || 0}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-teal transition-all duration-500" style={{ width: `${borrowing.progress || 0}%` }}></div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Last read: {borrowing.lastReadAt ? formatDate(borrowing.lastReadAt) : 'N/A'}</div>
                    
                    {/* Progress Update Form */}
                    {progressForms[borrowing.id]?.show ? (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={progressForms[borrowing.id].value}
                            onChange={(e) => setProgressForms(prev => ({
                              ...prev,
                              [borrowing.id]: { ...prev[borrowing.id], value: parseInt(e.target.value) }
                            }))}
                            className="flex-1"
                          />
                          <span className="text-xs font-bold text-primary-dark min-w-[2.5rem]">
                            {progressForms[borrowing.id].value}%
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleProgressUpdate(borrowing.id, progressForms[borrowing.id].value)}
                            disabled={updatingProgress[borrowing.id]}
                            className="flex-1 btn-accent py-1 rounded-lg text-xs font-semibold"
                          >
                            {updatingProgress[borrowing.id] ? 'Updating...' : 'Update'}
                          </button>
                          <button
                            onClick={() => setProgressForms(prev => ({ ...prev, [borrowing.id]: { show: false, value: 0 } }))}
                            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setProgressForms(prev => ({ 
                          ...prev, 
                          [borrowing.id]: { show: true, value: borrowing.progress || 0 } 
                        }))}
                        className="w-full mt-2 btn-accent py-1 rounded-lg text-xs font-semibold"
                      >
                        📊 Update Progress
                      </button>
                    )}
                  </div>
                  {borrowing.status === 'borrowed' && (
                    <button
                      type="button"
                      aria-label="Return this book"
                      tabIndex={0}
                      className="btn-success px-4 py-2 rounded-xl font-semibold shadow-glow hover-lift transition-all duration-200"
                      onClick={() => {
                        console.log('Return clicked', borrowing.id);
                        handleReturn(borrowing.id);
                      }}
                      disabled={returning[borrowing.id]}
                    >
                      {returning[borrowing.id] ? 'Returning...' : 'Return'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
        {/* Borrow History Timeline */}
        <section>
          <h2 className="text-2xl font-bold text-primary-dark mb-4 flex items-center gap-2">
            <span className="text-accent-gold">🕑</span> Borrow History
          </h2>
          {borrowings.length === 0 ? (
            <div className="text-gray-500">No borrow history yet.</div>
          ) : (
            <div className="space-y-6">
              {borrowings.map(borrowing => (
                <div key={borrowing.id} className="glass rounded-xl shadow-card p-4 flex flex-col sm:flex-row items-center gap-4 animate-fadeIn">
                  <div className="w-14 h-20 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    {borrowing.book?.image ? (
                      <img src={borrowing.book.image} alt={borrowing.book.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-lg">No Cover</span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <h3 className="font-bold text-base text-gray-800 dark:text-white mb-1 line-clamp-2">{borrowing.book?.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-xs mb-1 line-clamp-1">by {borrowing.book?.author}</p>
                    <span className="inline-block px-2 py-1 text-xs bg-gradient-primary text-white rounded-full font-medium w-fit mb-1">{borrowing.book?.genre}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${borrowing.status === 'returned' ? 'bg-green-100 text-green-800' : borrowing.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-accent-gold text-white'}`}>
                        {borrowing.status.charAt(0).toUpperCase() + borrowing.status.slice(1)}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(borrowing.borrowDate)}</span>
                    </div>
                  </div>
                  {borrowing.status === 'overdue' && (
                    <span className="ml-4 text-red-600 font-bold animate-pulse">Overdue!</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
