// frontend/src/pages/user/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [returning, setReturning] = useState({}); // { [borrowingId]: boolean }
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setUserLoading(true);
      try {
        const res = await axios.get('/api/auth/me', { withCredentials: true });
        setUser(res.data.user);
      } catch {
        setUser(null);
      } finally {
        setUserLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('/api/borrow/history', { withCredentials: true });
        setHistory(res.data.history);
      } catch (err) {
        setError('Failed to load borrow history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleReturn = async (borrowingId) => {
    setReturning(r => ({ ...r, [borrowingId]: true }));
    try {
      await axios.put(`/api/borrow/${borrowingId}/return`, {}, { withCredentials: true });
      toast.success('Book returned successfully!');
      // Refresh history
      const res = await axios.get('/api/borrow/history', { withCredentials: true });
      setHistory(res.data.history);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to return book.');
    } finally {
      setReturning(r => ({ ...r, [borrowingId]: false }));
    }
  };

  // Helper to determine status
  const getStatus = (borrowing) => {
    if (borrowing.returnedAt) return 'Returned';
    // Overdue if borrowedAt > 14 days ago (mock logic)
    const borrowedDate = new Date(borrowing.borrowedAt);
    const now = new Date();
    const diffDays = (now - borrowedDate) / (1000 * 60 * 60 * 24);
    if (diffDays > 14) return 'Overdue';
    return 'Active';
  };

  // Mock analytics: progress and last read
  const getProgress = (borrowing) => Math.floor(Math.random() * 100); // 0-99%
  const getLastRead = (borrowing) => {
    const daysAgo = Math.floor(Math.random() * 10);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toLocaleDateString();
  };

  const currentBorrowings = history.filter(b => !b.returnedAt);
  const overdueCount = history.filter(b => getStatus(b) === 'Overdue').length;
  const returnedCount = history.filter(b => getStatus(b) === 'Returned').length;
  const activeCount = history.filter(b => getStatus(b) === 'Active').length;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-2">My Library</h1>
      {userLoading ? (
        <div className="text-gray-500 mb-4">Loading user info...</div>
      ) : user ? (
        <div className="mb-6 text-lg">Welcome, <span className="font-semibold">{user.name}</span>!</div>
      ) : null}
      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{activeCount}</div>
          <div className="text-sm text-blue-800 dark:text-blue-200">Active</div>
        </div>
        <div className="bg-yellow-100 dark:bg-yellow-900 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{overdueCount}</div>
          <div className="text-sm text-yellow-800 dark:text-yellow-200">Overdue</div>
        </div>
        <div className="bg-green-100 dark:bg-green-900 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{returnedCount}</div>
          <div className="text-sm text-green-800 dark:text-green-200">Returned</div>
        </div>
      </div>
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <>
          {/* Current Borrowings */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Current Borrowings</h2>
            {currentBorrowings.length === 0 ? (
              <div className="text-gray-500">No active borrowings. Go borrow a book from the Home page!</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentBorrowings.map(borrowing => (
                  <div key={borrowing.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-24 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center overflow-hidden">
                        {borrowing.Book?.image ? (
                          <img src={borrowing.Book.image} alt={borrowing.Book.title} className="w-full h-full object-cover rounded" />
                        ) : (
                          <span className="text-gray-400">No Cover</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{borrowing.Book?.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300">{borrowing.Book?.author}</p>
                        <div className="text-sm text-gray-500">Borrowed: {new Date(borrowing.borrowedAt).toLocaleDateString()}</div>
                        <div className="mt-2">
                          <button
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-60"
                            onClick={() => handleReturn(borrowing.id)}
                            disabled={returning[borrowing.id]}
                          >
                            {returning[borrowing.id] ? 'Returning...' : 'Return Book'}
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Analytics */}
                    <div className="mt-2">
                      <div className="text-sm text-gray-500 mb-1">Reading Progress</div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-3 mb-1">
                        <div
                          className="bg-blue-500 h-3 rounded"
                          style={{ width: `${getProgress(borrowing)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-400">Last read: {getLastRead(borrowing)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Borrow History */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Borrow History</h2>
            {history.length === 0 ? (
              <div className="text-gray-500">No borrow history. Start borrowing books to see your history here!</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left">Book</th>
                      <th className="px-4 py-2 text-left">Borrowed At</th>
                      <th className="px-4 py-2 text-left">Returned At</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(borrowing => (
                      <tr key={borrowing.id} className="border-t border-gray-200 dark:border-gray-700">
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-14 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center overflow-hidden">
                              {borrowing.Book?.image ? (
                                <img src={borrowing.Book.image} alt={borrowing.Book.title} className="w-full h-full object-cover rounded" />
                              ) : (
                                <span className="text-gray-400">No Cover</span>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold">{borrowing.Book?.title}</div>
                              <div className="text-xs text-gray-500">{borrowing.Book?.author}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2">{new Date(borrowing.borrowedAt).toLocaleDateString()}</td>
                        <td className="px-4 py-2">{borrowing.returnedAt ? new Date(borrowing.returnedAt).toLocaleDateString() : '-'}</td>
                        <td className="px-4 py-2">
                          <span className={
                            getStatus(borrowing) === 'Returned'
                              ? 'bg-green-100 text-green-700 px-2 py-1 rounded text-xs'
                              : getStatus(borrowing) === 'Overdue'
                              ? 'bg-red-100 text-red-700 px-2 py-1 rounded text-xs'
                              : 'bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs'
                          }>
                            {getStatus(borrowing)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
