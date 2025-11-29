import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, LogOut, User, Menu, X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MetamaskButton from './MetamaskButton';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-dark-blue-alt border-b border-gray-800 sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Shield size={32} className="text-cyan-400" />
            </motion.div>
            <span className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
              Secure Drive 3.0
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-300 hover:text-cyan-400 transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/contact"
              className="text-gray-300 hover:text-cyan-400 transition-colors font-medium"
            >
              Contact
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-cyan-400 transition-colors font-medium flex items-center gap-2"
                >
                  <User size={18} />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 transition-all"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg text-white font-semibold transition-all shadow-lg shadow-cyan-500/50"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="md:hidden p-2 text-gray-400 hover:text-white"
          >
            {showMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-800 bg-dark-blue-alt"
          >
            <div className="px-4 py-4 space-y-3">
              <Link
                to="/"
                onClick={() => setShowMenu(false)}
                className="block text-gray-300 hover:text-cyan-400 transition-colors"
              >
                Home
              </Link>
              <Link
                to="/contact"
                onClick={() => setShowMenu(false)}
                className="block text-gray-300 hover:text-cyan-400 transition-colors"
              >
                Contact
              </Link>
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setShowMenu(false)}
                    className="block text-gray-300 hover:text-cyan-400 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowMenu(false);
                    }}
                    className="w-full text-left text-red-400 hover:text-red-300 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setShowMenu(false)}
                    className="block text-gray-300 hover:text-cyan-400 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setShowMenu(false)}
                    className="block px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white font-semibold text-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
