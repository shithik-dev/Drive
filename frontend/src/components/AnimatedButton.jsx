import React from 'react';
import { motion } from 'framer-motion';

const AnimatedButton = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary',
  className = '',
  type = 'button'
}) => {
  const baseClasses = 'px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600',
    outline: 'border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      animate={variant === 'primary' && !disabled ? {
        boxShadow: [
          '0 0 20px rgba(0, 240, 255, 0.3)',
          '0 0 30px rgba(0, 240, 255, 0.5)',
          '0 0 20px rgba(0, 240, 255, 0.3)',
        ],
      } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton;

