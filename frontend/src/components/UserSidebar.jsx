import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';

const UserSidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      toast.success('Logged out successfully!');
      navigate('/login');
    } catch (err) {
      toast.error('Logout failed.');
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <aside className="w-48 bg-white dark:bg-gray-900 shadow h-full flex flex-col p-4 justify-between">
      <div>
        <nav className="flex-1 space-y-2">
          <Link to="/dashboard" className="block py-2 px-3 rounded hover:bg-blue-100 dark:hover:bg-gray-800">Dashboard</Link>
        </nav>
        <button
          onClick={handleLogout}
          className="mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 w-full"
        >
          Logout
        </button>
      </div>
      <button
        onClick={toggleTheme}
        className="mt-8 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded hover:bg-gray-300 dark:hover:bg-gray-600 w-full"
      >
        {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
      </button>
      <ToastContainer />
    </aside>
  );
};

export default UserSidebar;
