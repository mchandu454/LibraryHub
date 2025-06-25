// File: src/App.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from "axios";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import UserSidebar from "./components/UserSidebar";

const Home = lazy(() => import('./pages/Home'));
const BookDetail = lazy(() => import('./pages/BookDetail'));
const Dashboard = lazy(() => import('./pages/user/Dashboard'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));

function App() {
  // Remove admin logic
  // const navigate = useNavigate();
  // const location = useLocation();

  // const handleLogout = async () => {
  //   try {
  //     await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });
  //     navigate("/");
  //   } catch (err) {
  //     console.error("Logout failed:", err);
  //   }
  // };

  // const showAdminSidebar = location.pathname.startsWith("/admin");
  // const showUserSidebar = location.pathname.startsWith("/user");

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex min-h-screen">
          {/* Only show UserSidebar for user pages */}
          {/* {showUserSidebar && <UserSidebar onLogout={handleLogout} />} */}
          <UserSidebar />
          <div className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/book/:id" element={<BookDetail />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* ❌ Fallback */}
              <Route path="*" element={<div>404 - Page Not Found</div>} />
            </Routes>
          </div>
        </div>
      </Suspense>
    </>
  );
}

export default App;
