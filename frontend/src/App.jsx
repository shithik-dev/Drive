import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Contact from './pages/Contact';
import './index.css';

/**
 * Helper function to delete all cookies
 * This function deletes cookies by setting their expiration date to the past
 */
const deleteAllCookies = () => {
  // Get all cookies
  const cookies = document.cookie.split(';');
  
  // Delete each cookie by setting it to expire in the past
  cookies.forEach(cookie => {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    
    // Delete cookie by setting expiration date to the past
    // We set it for the root path and all possible domain variations
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
  });
};

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === '/dashboard';

  /**
   * Force logout on page reload when VITE_FORCE_LOGOUT environment variable is set to "true"
   * 
   * This is useful for development/testing to ensure users are logged out on every page reload.
   * 
   * To enable this feature:
   * 1. Create or edit the .env file in the frontend directory
   * 2. Add: VITE_FORCE_LOGOUT=true
   * 3. Restart the development server
   * 
   * To disable: Remove the variable or set it to anything other than "true"
   */
  useEffect(() => {
    // Check if force logout is enabled via environment variable
    // For Vite projects, environment variables must be prefixed with VITE_
    const forceLogout = import.meta.env.VITE_FORCE_LOGOUT === 'true';
    
    if (forceLogout) {
      console.log('🔄 Force logout enabled: Clearing all authentication data...');
      
      // Clear localStorage authentication keys
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Clear all sessionStorage
      sessionStorage.clear();
      
      // Delete all cookies (especially authToken and any other auth-related cookies)
      deleteAllCookies();
      
      // Redirect to login page
      // Only redirect if not already on login or signup page to avoid redirect loops
      if (location.pathname !== '/login' && location.pathname !== '/signup') {
        navigate('/login', { replace: true });
      }
    }
  }, [navigate, location.pathname]); // Run on mount and when pathname changes

  return (
    <div className="App">
      {!isDashboard && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/contact" element={<Contact />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        {/* Catch-all route: Redirect any unknown routes to /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;