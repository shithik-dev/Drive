// Use dynamic import for ESM module in CommonJS context
let ipfsClient = null;

async function getIPFSClient() {
  if (!ipfsClient) {
    const { create } = await import('ipfs-http-client');
    ipfsClient = create({ url: 'http://127.0.0.1:5001/api/v0' });
  }
  return ipfsClient;
}

class IPFSService {
  constructor() {
    // Gateway URLs
    this.localGateway = 'http://127.0.0.1:8080/ipfs';
    this.publicGateway = 'https://ipfs.io/ipfs';
    // Initialize client lazily on first use
    this._clientPromise = null;
  }

  async _getClient() {
    if (!this._clientPromise) {
      this._clientPromise = getIPFSClient();
    }
    return await this._clientPromise;
  }

  async uploadFile(fileBuffer, fileName = 'uploaded-file') {
    try {
      console.log('📤 Uploading file to IPFS...');

      const client = await this._getClient();

      // Upload file to IPFS using ipfs-http-client
      const result = await client.add(fileBuffer, {
        pin: true,
        wrapWithDirectory: false
      });

      const cid = result.cid.toString();
      console.log('✅ File uploaded with CID:', cid);

      // Ensure folder exists in MFS so WebUI shows file
      await this.ensureMFSFolder('/uploads', client);

      const mfsPath = `/uploads/${fileName}`;

      // Save file into MFS (makes it visible in webui/files)
      await client.files.write(mfsPath, fileBuffer, {
        create: true,
        parents: true
      });

      console.log('📁 File stored in IPFS MFS at:', mfsPath);

      return {
        cid,
        path: result.path || fileName,
        mfsPath,
        size: result.size || fileBuffer.length,
        gatewayURL: `${this.localGateway}/${cid}`
      };

    } catch (error) {
      console.error('❌ IPFS upload error:', error.message);

      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch')) {
        throw new Error('IPFS daemon not running. Start using: ipfs daemon');
      }

      throw error;
    }
  }

  async ensureMFSFolder(folder, client) {
    try {
      if (!client) {
        client = await this._getClient();
      }
      await client.files.stat(folder);
    } catch (e) {
      await client.files.mkdir(folder, { parents: true });
      console.log('📁 Created MFS folder:', folder);
    }
  }

  async getFile(cid) {
    try {
      console.log('📥 Fetching file from IPFS:', cid);

      const client = await this._getClient();

      const chunks = [];
      for await (const chunk of client.cat(cid)) {
        chunks.push(chunk);
      }

      // Convert Uint8Array chunks to Buffer
      const buffers = chunks.map(chunk => Buffer.from(chunk));
      const buffer = Buffer.concat(buffers);
      
      console.log('✅ File retrieved, size:', buffer.length);

      return buffer;

    } catch (error) {
      console.error('❌ IPFS retrieval error:', error.message);

      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch')) {
        throw new Error('IPFS daemon offline.');
      }

      throw error;
    }
  }

  getGatewayUrl(cid, usePublic = false) {
    return `${usePublic ? this.publicGateway : this.localGateway}/${cid}`;
  }

  async checkIPFSConnection() {
    try {
      const client = await this._getClient();
      const node = await client.id();
      console.log('✅ Connected to IPFS:', node.id);
      return true;
    } catch (error) {
      console.log('❌ Not connected to IPFS:', error.message);
      return false;
    }
  }
}

module.exports = new IPFSService();
