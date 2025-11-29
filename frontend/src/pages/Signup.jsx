import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Shield, Wallet, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedButton from '../components/AnimatedButton';
import MetamaskButton from '../components/MetamaskButton';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const { signup } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password || formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    // Clear validation error for this field
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: ''
      });
    }
  };

  const handleWalletConnect = (address) => {
    setWalletAddress(address);
    setWalletConnected(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    if (!walletConnected) {
      setError('Please connect your MetaMask wallet');
      return;
    }

    setLoading(true);

    try {
      const result = await signup(formData.email, formData.password, walletAddress);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-blue flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl p-8 md:p-12 w-full max-w-md border border-cyan-500/30 relative z-10 max-h-[90vh] overflow-y-auto"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-block p-4 bg-cyan-500/20 rounded-2xl mb-4"
          >
            <Shield size={48} className="text-cyan-400" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-2 glow-text">Create Your Account</h2>
          <p className="text-gray-400">Join Secure Drive 3.0 today</p>
        </div>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg"
          >
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full pl-12 pr-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                  validationErrors.email 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-700 focus:border-cyan-500 focus:ring-cyan-500/20'
                }`}
                placeholder="Enter your email"
              />
            </div>
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-400">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full pl-12 pr-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                  validationErrors.password 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-700 focus:border-cyan-500 focus:ring-cyan-500/20'
                }`}
                placeholder="Enter your password"
              />
            </div>
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-400">{validationErrors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={`w-full pl-12 pr-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                  validationErrors.confirmPassword 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-700 focus:border-cyan-500 focus:ring-cyan-500/20'
                }`}
                placeholder="Confirm your password"
              />
            </div>
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-400">{validationErrors.confirmPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Connect Wallet
            </label>
            {walletConnected ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-3"
              >
                <CheckCircle size={20} className="text-green-400" />
                <div className="flex-1">
                  <p className="text-green-400 font-semibold text-sm">Wallet Connected</p>
                  <p className="text-gray-400 text-xs font-mono">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </p>
                </div>
              </motion.div>
            ) : (
              <MetamaskButton onConnect={handleWalletConnect} />
            )}
          </div>

          <AnimatedButton
            type="submit"
            disabled={loading || !walletConnected}
            variant="primary"
            className="w-full"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </AnimatedButton>
        </form>

        <p className="text-center mt-6 text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
            Login here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
