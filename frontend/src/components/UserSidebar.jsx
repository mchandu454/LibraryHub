import { useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import { DarkModeContext } from '../App';

const UserSidebar = ({ onLogout }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      toast.success('Logged out successfully!');
      navigate('/login');
      if (onLogout) onLogout();
    } catch (err) {
      toast.error('Logout failed.');
    }
  };

  return (
    <aside className="w-64 h-screen bg-gradient-card dark:bg-gradient-dark-card shadow-strong border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-6">
        {/* Logo Section */}
        <div className="mb-8 text-center">
          <div className="relative inline-block mb-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow mx-auto">
              <span className="text-2xl font-bold text-white">📚</span>
            </div>
            <div className="absolute -inset-2 bg-gradient-primary rounded-2xl blur opacity-20"></div>
          </div>
          <h2 className="heading-2 text-gradient-primary mb-1">LibraryHub</h2>
          <p className="caption-text">Your Personal Library</p>
          <div className="mt-4 w-12 h-1 bg-gradient-primary rounded-full mx-auto"></div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 space-y-3">
          <Link 
            to="/dashboard" 
            className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover-lift ${
              pathname === '/dashboard' 
                ? 'bg-gradient-primary text-white shadow-glow' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-secondary flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Dashboard</span>
              <span className="text-xs opacity-75">Overview & Stats</span>
            </div>
          </Link>
          
          <Link 
            to="/" 
            className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover-lift ${
              pathname === '/' || pathname === '/home'
                ? 'bg-gradient-primary text-white shadow-glow' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-accent flex items-center justify-center">
              <span className="text-lg">🏠</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Home</span>
              <span className="text-xs opacity-75">Browse Books</span>
            </div>
          </Link>
        </nav>
        
        {/* Theme Toggle */}
        <div className="mb-6">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 hover-lift shadow-soft"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-accent flex items-center justify-center">
              {darkMode ? (
                <span className="text-lg">☀️</span>
              ) : (
                <span className="text-lg">🌙</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
              <span className="text-xs opacity-75">Toggle Theme</span>
            </div>
          </button>
        </div>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-danger text-white font-semibold shadow-glow hover-lift transition-all duration-300"
        >
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="text-lg">🚪</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Logout</span>
            <span className="text-xs opacity-75">Sign Out</span>
          </div>
        </button>
      </div>
    </aside>
  );
};

export default UserSidebar;
