import { useState } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from 'react-toastify';

const Login = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      console.log(res.data);
      window.dispatchEvent(new Event('storage'));
      toast.success("Login successful!");
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-primary-light via-glass to-accent-teal animate-fadeIn">
      {/* Illustration/Side Panel */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-accent-gold to-accent-teal">
        <img src="/login-illustration.svg" alt="Login Illustration" className="w-96 h-96 object-contain drop-shadow-glow" />
      </div>
      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <form onSubmit={handleLogin} className="glass rounded-2xl shadow-glow p-10 w-full max-w-md flex flex-col gap-6 animate-pop">
          <h1 className="text-3xl font-extrabold text-primary-dark mb-2 tracking-tight text-center">Welcome Back</h1>
          {location.state?.email ? (
            <p className="text-green-600 dark:text-green-400 text-center mb-4">Registration successful! Please login to continue.</p>
          ) : (
            <p className="text-gray-600 dark:text-gray-300 text-center mb-4">Sign in to your LibraryHub account</p>
          )}
          <div className="flex flex-col gap-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              className="px-5 py-3 rounded-xl bg-glass dark:bg-darkglass shadow-card border-none focus:ring-2 focus:ring-primary outline-none text-lg transition-all animate-fadeIn"
              required
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="px-5 py-3 rounded-xl bg-glass dark:bg-darkglass shadow-card border-none focus:ring-2 focus:ring-primary outline-none text-lg transition-all animate-fadeIn"
              required
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {error}
            </div>
          )}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-3 rounded-xl font-bold shadow-glow hover-lift transition-all duration-200 mt-2 animate-pop disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Login'}
          </button>
          <div className="text-center text-sm text-gray-500 mt-2">
            Don&apos;t have an account? <Link to="/register" className="text-primary font-semibold hover:underline">Register</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
