import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          <Shield size={32} />
          <span>Secure Drive 3.0</span>
        </Link>
        
        <div style={styles.navLinks}>
          <Link to="/" style={styles.navLink}>Home</Link>
          <Link to="/contact" style={styles.navLink}>Contact Us</Link>
          
          {user ? (
            <div style={styles.userSection}>
              <Link to="/dashboard" style={styles.navLink}>
                <User size={20} />
                Dashboard
              </Link>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                <LogOut size={20} />
                Logout
              </button>
            </div>
          ) : (
            <div style={styles.authLinks}>
              <Link to="/login" style={styles.navLink}>Login</Link>
              <Link to="/signup" style={{...styles.navLink, ...styles.signupBtn}}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '1rem 0',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: 'white',
    textDecoration: 'none',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem'
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'opacity 0.3s ease'
  },
  signupBtn: {
    background: 'rgba(255,255,255,0.2)',
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.3)'
  },
  authLinks: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  userSection: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  logoutBtn: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.3)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px'
  }
};

export default Navbar;