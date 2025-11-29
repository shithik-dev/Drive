import Web3 from 'web3';

let web3;

export const initWeb3 = async () => {
  if (window.ethereum) {
    try {
      web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      return web3;
    } catch (error) {
      throw new Error('User denied account access: ' + error.message);
    }
  } else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider);
    return web3;
  } else {
    throw new Error('No Ethereum browser detected. Please install MetaMask.');
  }
};

export const getWeb3 = () => {
  if (!web3) {
    throw new Error('Web3 not initialized. Please call initWeb3 first.');
  }
  return web3;
};

export const getAccounts = async () => {
  const web3 = getWeb3();
  return await web3.eth.getAccounts();
};

export const signMessage = async (message, account) => {
  const web3 = getWeb3();
  return await web3.eth.personal.sign(message, account, '');
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};