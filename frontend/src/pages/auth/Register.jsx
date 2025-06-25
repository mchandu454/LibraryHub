import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from 'react-toastify';

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post("/api/auth/register", { name, email, password });
      // Optionally, auto-login or redirect to login
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <form onSubmit={handleRegister} className="bg-white dark:bg-gray-800 p-6 rounded shadow-md w-80">
        <h2 className="text-xl font-bold mb-4">Register</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <input
          type="text"
          placeholder="Name"
          className="w-full p-2 mb-2 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          className="bg-green-500 text-white w-full p-2 rounded hover:bg-green-600 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
        <div className="mt-4 text-sm text-center">
          Already have an account? <Link to="/login" className="text-blue-600">Login</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
