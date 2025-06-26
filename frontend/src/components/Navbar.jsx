import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = ({ isAuthenticated, onLogout, darkMode, toggleDarkMode, user, authLoading }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  const navLinks = [
    { to: '/home', label: 'Home', icon: '🏠' },
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  ];

  // Get user initial or fallback icon
  const userInitial = user?.name ? user.name[0].toUpperCase() : '👤';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/home')}>
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-accent transition-all duration-300">
                <span className="text-xl font-bold text-white">📚</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-primary rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gradient-primary tracking-tight">LibraryHub</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">Your Digital Library</span>
            </div>
      </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
        {/* Navigation links */}
        {isAuthenticated && navLinks.map(link => (
          <Link
            to={link.to}
            key={link.to}
            aria-label={link.label}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover-lift ${
              location.pathname === link.to
                ? 'bg-gradient-primary text-white shadow-glow'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <span className="text-lg">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}

        {/* Theme toggle */}
        <button
              className="relative p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 hover-lift shadow-soft"
          onClick={toggleDarkMode}
          aria-label="Toggle theme"
        >
              <div className="relative">
          {darkMode ? (
            <span className="text-xl">🌙</span>
          ) : (
            <span className="text-xl">☀️</span>
          )}
                <div className="absolute -inset-1 bg-gradient-accent rounded-xl blur opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
              </div>
        </button>

            {/* Auth buttons */}
        {authLoading ? (
              <div className="flex items-center justify-center w-24 h-10">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-200 border-t-primary-600"></div>
          </div>
        ) : isAuthenticated ? (
              <div className="flex items-center gap-4">
                {/* User profile */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-3 p-2 rounded-xl bg-gradient-secondary text-white font-medium shadow-glow hover-lift transition-all duration-300"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold">
                      {userInitial}
                    </div>
                    <span className="hidden sm:block">{user?.name || 'User'}</span>
                    <span className="text-sm">▼</span>
                  </button>
                  
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-strong border border-gray-200 dark:border-gray-700 py-2 animate-scale-in">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                      </div>
                      <button
                        onClick={onLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button 
                className="btn-primary"
                onClick={() => navigate('/login')}
              >
                🔐 Login
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-xl">☰</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700 animate-slide-up">
            <div className="space-y-2">
              {isAuthenticated && navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'bg-gradient-primary text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
              
              {!authLoading && !isAuthenticated && (
                <button 
                  className="w-full btn-primary"
                  onClick={() => { navigate('/login'); setMenuOpen(false); }}
                >
                  🔐 Login
                </button>
              )}
              
              {!authLoading && isAuthenticated && (
                <button 
                  className="w-full btn-danger"
                  onClick={() => { onLogout(); setMenuOpen(false); }}
                >
                  🚪 Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 