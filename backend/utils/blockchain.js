const Web3 = require('web3');
const path = require('path');
const fs = require('fs');

class BlockchainService {
  constructor() {
    try {
      // Use Web3 version 1.x syntax
      this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
      this.contractAddress = process.env.CONTRACT_ADDRESS;
      
      console.log('🔗 Web3 initialized successfully');
      console.log('📝 Contract Address:', this.contractAddress);
      
      // Check if Ganache is running
      this.checkConnection();
      
      // Temporary: Allow development without contract
      if (!this.contractAddress || this.contractAddress === '0x0000000000000000000000000000000000000000') {
        console.log('⚠️  CONTRACT_ADDRESS not set. Running in development mode without blockchain.');
        this.contract = null;
        return;
      }
      
      // Load contract
      this.loadContract();
      
    } catch (error) {
      console.log('❌ Web3 initialization failed:', error.message);
      this.contract = null;
    }
  }

  async checkConnection() {
    try {
      const isListening = await this.web3.eth.net.isListening();
      console.log('✅ Connected to Ethereum node:', isListening);
      
      const accounts = await this.web3.eth.getAccounts();
      console.log('📋 Available accounts:', accounts.length);
      
      if (accounts.length > 0) {
        const balance = await this.web3.eth.getBalance(accounts[0]);
        console.log('💰 Account balance:', this.web3.utils.fromWei(balance, 'ether'), 'ETH');
      }
      
      return true;
    } catch (error) {
      console.log('❌ Cannot connect to Ethereum node. Make sure Ganache is running on port 7545');
      return false;
    }
  }

  loadContract() {
    try {
      const contractPath = path.join(__dirname, '..', '..', 'blockchain', 'build', 'contracts', 'SecureDrive.json');
      
      if (!fs.existsSync(contractPath)) {
        console.log('⚠️  Contract file not found at:', contractPath);
        this.contract = null;
        return;
      }
      
      const contractJSON = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
      
      if (!contractJSON.abi) {
        console.log('⚠️  Contract ABI not found in JSON file');
        this.contract = null;
        return;
      }
      
      this.contract = new this.web3.eth.Contract(contractJSON.abi, this.contractAddress);
      console.log('✅ Smart contract loaded successfully');
      
    } catch (error) {
      console.log('⚠️  Failed to load contract:', error.message);
      this.contract = null;
    }
  }

  async uploadFileToBlockchain(fileData, signature) {
    if (!this.contract) {
      console.log('📝 Development mode: Simulating blockchain upload for file:', fileData.fileName);
      return { 
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
        status: 'development_mode'
      };
    }

    try {
      const accounts = await this.web3.eth.getAccounts();
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Make sure Ganache is running.');
      }

      console.log('📤 Uploading file to blockchain:', fileData.fileName);
      console.log('📝 File data:', fileData);

      const result = await this.contract.methods
        .uploadFile(
          fileData.fileId,
          fileData.ipfsHash,
          fileData.fileName,
          fileData.fileType,
          fileData.fileSize.toString(),
          fileData.folderId
        )
        .send({ 
          from: accounts[0], 
          gas: 3000000 
        });

      console.log('✅ File uploaded to blockchain successfully');
      return result;
    } catch (error) {
      console.error('❌ Blockchain upload failed:', error);
      throw new Error(`Blockchain upload failed: ${error.message}`);
    }
  }

  async createFolderOnBlockchain(folderData, signature) {
    if (!this.contract) {
      console.log('📁 Development mode: Simulating folder creation:', folderData.folderName);
      return { 
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
        status: 'development_mode'
      };
    }

    try {
      const accounts = await this.web3.eth.getAccounts();

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Make sure Ganache is running.');
      }

      console.log('📁 Creating folder on blockchain:', folderData.folderName);

      const result = await this.contract.methods
        .createFolder(folderData.folderId, folderData.folderName)
        .send({ 
          from: accounts[0], 
          gas: 3000000 
        });

      console.log('✅ Folder created on blockchain successfully');
      return result;
    } catch (error) {
      console.error('❌ Blockchain folder creation failed:', error);
      throw new Error(`Blockchain folder creation failed: ${error.message}`);
    }
  }

  async verifySignature(message, signature, address) {
    try {
      const recoveredAddress = this.web3.eth.accounts.recover(message, signature);
      const isValid = recoveredAddress.toLowerCase() === address.toLowerCase();
      console.log('🔐 Signature verification:', isValid ? 'VALID' : 'INVALID');
      return isValid;
    } catch (error) {
      console.error('❌ Signature verification failed:', error);
      return false;
    }
  }

  async getUserFiles(userAddress) {
    if (!this.contract) {
      console.log('📝 Development mode: Returning empty files list');
      return [];
    }

    try {
      console.log('📋 Fetching files for address:', userAddress);
      const files = await this.contract.methods.getUserFiles(userAddress).call();
      console.log('✅ Retrieved files count:', files.length);
      return files;
    } catch (error) {
      console.error('❌ Failed to get user files:', error);
      throw new Error(`Failed to get user files: ${error.message}`);
    }
  }

  async getUserFolders(userAddress) {
    if (!this.contract) {
      console.log('📁 Development mode: Returning empty folders list');
      return [];
    }

    try {
      console.log('📋 Fetching folders for address:', userAddress);
      const folders = await this.contract.methods.getUserFolders(userAddress).call();
      console.log('✅ Retrieved folders count:', folders.length);
      return folders;
    } catch (error) {
      console.error('❌ Failed to get user folders:', error);
      throw new Error(`Failed to get user folders: ${error.message}`);
    }
  }

  // Get current network info
  async getNetworkInfo() {
    try {
      const networkId = await this.web3.eth.net.getId();
      const isListening = await this.web3.eth.net.isListening();
      const blockNumber = await this.web3.eth.getBlockNumber();
      
      return {
        networkId,
        isListening,
        blockNumber,
        provider: this.web3.currentProvider.host
      };
    } catch (error) {
      return {
        error: error.message
      };
    }
  }
}

module.exports = new BlockchainService();