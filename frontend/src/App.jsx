// File: src/App.jsx
import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import axios from "axios";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";

// Layouts
import UserSidebar from "./components/UserSidebar";

const Home = lazy(() => import('./pages/Home'));
const BookDetail = lazy(() => import('./pages/BookDetail'));
const Dashboard = lazy(() => import('./pages/user/Dashboard'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));

// Dark mode context
const DarkModeContext = React.createContext();

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center p-4">
          <div className="text-center max-w-2xl">
            <div className="text-red-500 text-8xl mb-6">⚠️</div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-primary text-white rounded-xl hover-lift shadow-glow transition-all duration-200 font-medium"
              >
                Refresh Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="block w-full px-6 py-3 bg-gradient-secondary text-white rounded-xl hover-lift shadow-glow transition-all duration-200 font-medium"
              >
                Go to Home
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs overflow-auto">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem('token')));
  const [authLoading, setAuthLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for saved preference, default to system preference
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Update localStorage and document class when dark mode changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Fetch user info if authenticated
  useEffect(() => {
    const fetchUser = async () => {
      setAuthLoading(true);
      if (isAuthenticated) {
        try {
          const res = await axios.get('/api/members/me', { withCredentials: true });
          setUser(res.data.user);
        } catch (err) {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('token');
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    };
    fetchUser();
  }, [isAuthenticated]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Listen for login event (token set in localStorage)
  useEffect(() => {
    const onStorage = () => {
      setIsAuthenticated(Boolean(localStorage.getItem('token')));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Redirect logged-in users from landing to /home
  useEffect(() => {
    if (isAuthenticated && location.pathname === '/') {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // Hide Navbar on landing and auth pages only
  const hideNavbar = ["/", "/login", "/register"].includes(location.pathname);

  // After login/signup, redirect to /home (simulate by watching location)
  useEffect(() => {
    if (isAuthenticated && ["/login", "/register"].includes(location.pathname)) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // Set axios defaults
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;
  axios.defaults.withCredentials = true;
  axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return (
    <ErrorBoundary>
      <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
        <div className={`min-h-screen transition-all duration-300 ${
          darkMode 
            ? 'dark bg-gradient-dark text-white' 
            : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-800'
        }`}>
          {!hideNavbar && (
            <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} user={user} authLoading={authLoading} />
          )}
          <div className={hideNavbar ? '' : 'pt-20'}>
            <ToastContainer 
              position="top-right" 
              autoClose={3000} 
              hideProgressBar={false} 
              newestOnTop 
              closeOnClick 
              pauseOnFocusLoss 
              draggable 
              pauseOnHover 
              theme={darkMode ? "dark" : "light"}
              toastClassName="!rounded-xl !shadow-glow"
            />
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-200 border-t-blue-600"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-ping"></div>
                </div>
              </div>
            }>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/book/:id" element={<BookDetail />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    {/* ❌ Fallback */}
                    <Route path="*" element={
                      <div className="text-center py-12 sm:py-16 lg:py-20">
                        <div className="mb-6 sm:mb-8">
                          <div className="text-6xl sm:text-8xl mb-4">📚</div>
                          <h1 className="heading-1 mb-4">404 - Page Not Found</h1>
                          <p className="body-text text-lg">
                            The page you're looking for doesn't exist.
                          </p>
                        </div>
                        <button 
                          onClick={() => navigate('/')} 
                          className="btn-primary px-6 sm:px-8 py-3 sm:py-4"
                        >
                          Go Home
                        </button>
                      </div>
                    } />
                  </Routes>
            </Suspense>
          </div>
        </div>
      </DarkModeContext.Provider>
    </ErrorBoundary>
  );
}

// Export the context for use in other components
export { DarkModeContext };
export default App;
