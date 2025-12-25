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
      
      // Check if contract address is valid
      if (!this.contractAddress || this.contractAddress === '0x0000000000000000000000000000000000000000') {
        console.log('⚠️  CONTRACT_ADDRESS not set. Running in development mode without blockchain.');
        this.contract = null;
        return;
      }
      
      // Validate contract address format
      if (!this.contractAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        console.log('❌ Invalid contract address format:', this.contractAddress);
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
      console.log('❌ Cannot connect to Ethereum node. Make sure Ganache is running on port 8545');
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
      
      // Verify the contract is deployed at the address
      this.verifyContractDeployment();
      
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
      if (!message || !signature || !address) {
        console.log('❌ Signature verification failed: Missing parameters');
        return false;
      }

      // In development mode without contract, allow signature verification
      if (!this.web3 || !this.contract) {
        console.log('⚠️  Development mode: Skipping signature verification');
        return true;
      }

      const recoveredAddress = this.web3.eth.accounts.recover(message, signature);
      const isValid = recoveredAddress.toLowerCase() === address.toLowerCase();
      console.log('🔐 Signature verification:', isValid ? 'VALID' : 'INVALID');
      return isValid;
    } catch (error) {
      console.error('❌ Signature verification failed:', error);
      // In development, allow if web3 is not available
      if (!this.web3) {
        console.log('⚠️  Development mode: Allowing signature due to missing web3');
        return true;
      }
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
      
      // Debug: log the first file structure if any exist
      if (files.length > 0) {
        console.log('📋 First file structure:', JSON.stringify(files[0], null, 2));
      }
      
      // Convert Solidity struct array to JavaScript objects
      // Note: Truffle/Web3 may return different property names depending on version
      return files.map((file, index) => ({
        fileId: file.fileId || `file-${index}-${Date.now()}`,
        ipfsHash: file.ipfsHash || file[0] || '',
        fileName: file.fileName || file[1] || '',
        fileType: file.fileType || file[2] || '',
        fileSize: file.fileSize ? file.fileSize.toString() : (file[3] ? file[3].toString() : '0'),
        uploadTime: file.uploadTime ? file.uploadTime.toString() : (file[4] ? file[4].toString() : Date.now().toString()),
        uploader: file.uploader || file[5] || '',
        folderId: file.folderId || file[6] || 'root'
      }));
    } catch (error) {
      console.error('❌ Failed to get user files:', error);
      // Return empty array instead of throwing to prevent frontend errors
      return [];
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
      
      // Debug: log the first folder structure if any exist
      if (folders.length > 0) {
        console.log('📁 First folder structure:', JSON.stringify(folders[0], null, 2));
      }
      
      // Convert Solidity struct array to JavaScript objects
      // Note: Truffle/Web3 may return different property names depending on version
      return folders.map((folder, index) => ({
        _id: folder.folderId || folder[0] || `folder-${index}-${Date.now()}`,
        folderId: folder.folderId || folder[0] || `folder-${index}-${Date.now()}`,
        folderName: folder.folderName || folder[1] || '',
        createdTime: folder.createdTime ? folder.createdTime.toString() : (folder[2] ? folder[2].toString() : Date.now().toString()),
        creator: folder.creator || folder[3] || ''
      }));
    } catch (error) {
      console.error('❌ Failed to get user folders:', error);
      // Return empty array instead of throwing to prevent frontend errors
      return [];
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
  
  async verifyContractDeployment() {
    try {
      if (!this.contract || !this.contractAddress) {
        console.log('❌ Contract not loaded, skipping verification');
        return false;
      }
      
      // Try to call a simple method to verify contract is deployed
      // Using getCode to check if there's actual contract code at the address
      const code = await this.web3.eth.getCode(this.contractAddress);
      
      if (code === '0x' || code === '0x0') {
        console.log('❌ No contract code found at address:', this.contractAddress);
        console.log('⚠️  Please make sure the contract is deployed to the correct address');
        this.contract = null; // Reset contract so it falls back to dev mode
        return false;
      } else {
        console.log('✅ Contract verified at address:', this.contractAddress);
        return true;
      }
    } catch (error) {
      console.log('⚠️  Contract verification failed:', error.message);
      // Don't reset the contract here, let other methods handle fallbacks
      return false;
    }
  }
}

module.exports = new BlockchainService();