import React, { useState } from 'react';
import { Wallet } from 'lucide-react';
import { initWeb3, getAccounts } from '../utils/web3';
import AnimatedButton from './AnimatedButton';
import { motion } from 'framer-motion';

const MetamaskButton = ({ onConnect, connectedAddress }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    
    try {
      await initWeb3();
      const accounts = await getAccounts();
      if (accounts && accounts.length > 0) {
        if (onConnect) {
          onConnect(accounts[0]);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  if (connectedAddress) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg"
      >
        <Wallet size={18} className="text-green-400" />
        <span className="text-green-400 font-mono text-sm">
          {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
        </span>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <AnimatedButton
        onClick={handleConnect}
        disabled={loading}
        variant="outline"
        className="w-full"
      >
        <Wallet size={18} />
        {loading ? 'Connecting...' : 'Connect MetaMask'}
      </AnimatedButton>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default MetamaskButton;

