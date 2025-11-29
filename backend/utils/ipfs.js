const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class IPFSService {
  constructor() {
    this.baseURL = 'http://localhost:5001/api/v0';
  }

  async uploadFile(fileBuffer) {
    try {
      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename: 'uploaded-file',
        contentType: 'application/octet-stream'
      });

      const response = await axios.post(`${this.baseURL}/add`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000 // 30 seconds timeout
      });

      console.log('✅ File uploaded to IPFS with CID:', response.data.Hash);
      return {
        cid: response.data.Hash,
        path: response.data.Name,
        size: response.data.Size
      };
    } catch (error) {
      console.error('❌ IPFS upload error:', error.message);
      throw new Error(`IPFS upload failed: ${error.message}`);
    }
  }

  async getFile(cid) {
    try {
      const response = await axios.get(`${this.baseURL}/cat?arg=${cid}`, {
        responseType: 'arraybuffer',
        timeout: 30000
      });
      
      return Buffer.from(response.data);
    } catch (error) {
      console.error('❌ IPFS retrieval error:', error.message);
      throw new Error(`IPFS retrieval failed: ${error.message}`);
    }
  }

  async checkIPFSConnection() {
    try {
      await axios.get(`${this.baseURL}/id`, { timeout: 5000 });
      console.log('✅ IPFS daemon is running');
      return true;
    } catch (error) {
      console.log('❌ IPFS daemon is not running');
      return false;
    }
  }
}

module.exports = new IPFSService();