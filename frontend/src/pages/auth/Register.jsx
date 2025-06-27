import { useState } from "react";
import api from '../../api';
import { useNavigate, Link } from "react-router-dom";
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting to register with:', { name: formData.name, email: formData.email });
      
      const registerResponse = await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      console.log('Registration successful:', registerResponse.data);
      
      localStorage.setItem('token', registerResponse.data.token);
      localStorage.setItem('user', JSON.stringify(registerResponse.data.user));
      
      toast.success("Registration successful! Please login to continue.");
      navigate("/login", { state: { email: formData.email } });
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || "Registration failed");
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-primary-light via-glass to-accent-teal animate-fadeIn">
      {/* Illustration/Side Panel */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-accent-gold to-accent-teal">
        <img src="/register-illustration.svg" alt="Register Illustration" className="w-96 h-96 object-contain drop-shadow-glow" />
      </div>
      {/* Register Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <form onSubmit={handleSubmit} className="glass rounded-2xl shadow-glow p-10 w-full max-w-md flex flex-col gap-6 animate-pop">
          <h1 className="text-3xl font-extrabold text-primary-dark mb-2 tracking-tight text-center">Create Account</h1>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-4">Join LibraryHub and start your reading journey</p>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={formData.name}
              onChange={handleChange}
              name="name"
              placeholder="Full Name"
              className="px-5 py-3 rounded-xl bg-glass dark:bg-darkglass shadow-card border-none focus:ring-2 focus:ring-primary outline-none text-lg transition-all animate-fadeIn"
              required
            />
            <input
              type="email"
              value={formData.email}
              onChange={handleChange}
              name="email"
              placeholder="Email"
              className="px-5 py-3 rounded-xl bg-glass dark:bg-darkglass shadow-card border-none focus:ring-2 focus:ring-primary outline-none text-lg transition-all animate-fadeIn"
              required
            />
            <input
              type="password"
              value={formData.password}
              onChange={handleChange}
              name="password"
              placeholder="Password"
              className="px-5 py-3 rounded-xl bg-glass dark:bg-darkglass shadow-card border-none focus:ring-2 focus:ring-primary outline-none text-lg transition-all animate-fadeIn"
              required
            />
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              name="confirmPassword"
              placeholder="Confirm Password"
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
          <div className="text-center text-sm text-gray-500 mt-2">
            Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
