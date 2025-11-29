import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data:', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const clearError = () => setError('');

  const signup = async (email, password, walletAddress) => {
    try {
      clearError();
      const response = await authAPI.signup({
        email,
        password,
        walletAddress
      });
      
      // Check if response data exists
      if (!response.data) {
        throw new Error('No response data received');
      }

      const { token, data } = response.data;
      
      if (!token || !data) {
        throw new Error('Invalid response format');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Signup failed. Please try again.';
      setError(errorMessage);
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  };

  const login = async (email, password) => {
    try {
      clearError();
      const response = await authAPI.login({ email, password });
      
      if (!response.data) {
        throw new Error('No response data received');
      }

      const { token, data } = response.data;
      
      if (!token || !data) {
        throw new Error('Invalid response format');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Login failed. Please check your credentials.';
      setError(errorMessage);
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    clearError();
  };

  const value = {
    user,
    error,
    signup,
    login,
    logout,
    loading,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};