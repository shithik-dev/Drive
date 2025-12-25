const express = require('express');
const multer = require('multer');
const ipfsService = require('../utils/ipfs');
const blockchainService = require('../utils/blockchain');
const auth = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(auth);

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('📤 Upload request received');
    console.log('📋 Headers:', { signature: req.headers.signature ? 'present' : 'missing', message: req.headers.message ? 'present' : 'missing' });
    console.log('📁 Body:', req.body);
    console.log('📄 File:', req.file ? { name: req.file.originalname, size: req.file.size, type: req.file.mimetype } : 'missing');
    
    const { folderId = 'root' } = req.body;
    const { signature, message } = req.headers;

    // Validate file
    if (!req.file) {
      console.error('❌ No file in request');
      return res.status(400).json({
        status: 'fail',
        message: 'No file uploaded'
      });
    }

    // Verify signature
    if (!signature || !message) {
      console.error('❌ Missing signature or message headers');
      return res.status(400).json({
        status: 'fail',
        message: 'Signature and message headers are required'
      });
    }

    const signatureVerified = await blockchainService.verifySignature(
      message,
      signature,
      req.user.walletAddress
    );

    if (!signatureVerified) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid digital signature'
      });
    }

    const file = req.file;
    
    // Upload to IPFS
    let ipfsResult;
    try {
      ipfsResult = await ipfsService.uploadFile(file.buffer, file.originalname);
    } catch (ipfsError) {
      console.error('IPFS upload failed:', ipfsError);
      // In development, allow upload without IPFS
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
        console.log('⚠️  Development mode: Continuing without IPFS');
        ipfsResult = {
          cid: `dev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          path: file.originalname,
          size: file.size
        };
      } else {
        return res.status(500).json({
          status: 'fail',
          message: 'IPFS upload failed: ' + ipfsError.message
        });
      }
    }

    const fileData = {
      fileId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ipfsHash: ipfsResult.cid.toString(),
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      folderId
    };

    // Store on blockchain
    const blockchainResult = await blockchainService.uploadFileToBlockchain(fileData, signature);

    console.log('✅ File uploaded successfully:', fileData.fileName);
    res.status(200).json({
      status: 'success',
      data: {
        file: fileData,
        transaction: blockchainResult
      }
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(400).json({
      status: 'fail',
      message: error.message || 'File upload failed',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.post('/folder', async (req, res) => {
  try {
    const { folderName } = req.body;
    const { signature, message } = req.headers;

    // Validate folder name
    if (!folderName || !folderName.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Folder name is required'
      });
    }

    // Validate signature headers
    if (!signature || !message) {
      return res.status(400).json({
        status: 'fail',
        message: 'Signature and message headers are required'
      });
    }

    const signatureVerified = await blockchainService.verifySignature(
      message,
      signature,
      req.user.walletAddress
    );

    if (!signatureVerified) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid digital signature'
      });
    }

    const folderData = {
      folderId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      folderName
    };

    const blockchainResult = await blockchainService.createFolderOnBlockchain(folderData, signature);

    res.status(200).json({
      status: 'success',
      data: {
        folder: folderData,
        transaction: blockchainResult
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

router.get('/files', async (req, res) => {
  try {
    const files = await blockchainService.getUserFiles(req.user.walletAddress);

    res.status(200).json({
      status: 'success',
      data: {
        files
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

router.get('/folders', async (req, res) => {
  try {
    const folders = await blockchainService.getUserFolders(req.user.walletAddress);

    res.status(200).json({
      status: 'success',
      data: {
        folders
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

router.get('/download/:ipfsHash', async (req, res) => {
  try {
    const { ipfsHash } = req.params;
    
    // Verify user has access to this file (check if file belongs to user)
    const userFiles = await blockchainService.getUserFiles(req.user.walletAddress);
    const file = userFiles.find(f => f.ipfsHash === ipfsHash);
    
    if (!file) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have access to this file'
      });
    }

    console.log('📥 Downloading file from IPFS:', ipfsHash);
    
    // Retrieve file from IPFS
    let fileBuffer;
    try {
      fileBuffer = await ipfsService.getFile(ipfsHash);
    } catch (ipfsError) {
      console.error('IPFS retrieval failed:', ipfsError);
      
      // In development mode, return a placeholder if IPFS is not available
      if (process.env.NODE_ENV === 'development' && ipfsHash.startsWith('dev-')) {
        fileBuffer = Buffer.from('Development mode: File content not available (IPFS not running)');
      } else {
        return res.status(500).json({
          status: 'fail',
          message: 'Failed to retrieve file from IPFS: ' + ipfsError.message
        });
      }
    }

    // Set appropriate headers for file download
    res.setHeader('Content-Type', file.fileType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.fileName)}"`);
    res.setHeader('Content-Length', fileBuffer.length);

    // Send file buffer
    res.send(fileBuffer);
    console.log('✅ File downloaded successfully:', file.fileName);
  } catch (error) {
    console.error('❌ Download error:', error);
    res.status(500).json({
      status: 'fail',
      message: error.message || 'File download failed'
    });
  }
});

router.get('/view/:ipfsHash', async (req, res) => {
  try {
    const { ipfsHash } = req.params;
    
    // Verify user has access to this file
    const userFiles = await blockchainService.getUserFiles(req.user.walletAddress);
    const file = userFiles.find(f => f.ipfsHash === ipfsHash);
    
    if (!file) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have access to this file'
      });
    }

    console.log('👁️  Viewing file from IPFS:', ipfsHash);
    
    // Retrieve file from IPFS
    let fileBuffer;
    try {
      fileBuffer = await ipfsService.getFile(ipfsHash);
    } catch (ipfsError) {
      console.error('IPFS retrieval failed:', ipfsError);
      
      // In development mode, return a placeholder if IPFS is not available
      if (process.env.NODE_ENV === 'development' && ipfsHash.startsWith('dev-')) {
        fileBuffer = Buffer.from('Development mode: File content not available (IPFS not running)');
      } else {
        return res.status(500).json({
          status: 'fail',
          message: 'Failed to retrieve file from IPFS: ' + ipfsError.message,
          gatewayUrl: ipfsService.getGatewayUrl(ipfsHash, true) // Provide public gateway as fallback
        });
      }
    }

    // Set appropriate headers for viewing (inline instead of attachment)
    res.setHeader('Content-Type', file.fileType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.fileName)}"`);
    res.setHeader('Content-Length', fileBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // Send file buffer
    res.send(fileBuffer);
    console.log('✅ File viewed successfully:', file.fileName);
  } catch (error) {
    console.error('❌ View error:', error);
    res.status(500).json({
      status: 'fail',
      message: error.message || 'File view failed'
    });
  }
});

// New endpoint to get gateway URLs
router.get('/gateway/:ipfsHash', async (req, res) => {
  try {
    const { ipfsHash } = req.params;
    const { usePublic } = req.query;
    
    // Verify user has access to this file
    const userFiles = await blockchainService.getUserFiles(req.user.walletAddress);
    const file = userFiles.find(f => f.ipfsHash === ipfsHash);
    
    if (!file) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have access to this file'
      });
    }

    const gatewayUrl = ipfsService.getGatewayUrl(ipfsHash, usePublic === 'true');
    
    res.status(200).json({
      status: 'success',
      data: {
        gatewayUrl,
        localGateway: ipfsService.getGatewayUrl(ipfsHash, false),
        publicGateway: ipfsService.getGatewayUrl(ipfsHash, true),
        fileName: file.fileName,
        fileType: file.fileType
      }
    });
  } catch (error) {
    console.error('❌ Gateway URL error:', error);
    res.status(500).json({
      status: 'fail',
      message: error.message || 'Failed to get gateway URL'
    });
  }
});

router.get('/ipfs-health', async (req, res) => {
  try {
    const ipfsService = require('../utils/ipfs');
    const isConnected = await ipfsService.checkIPFSConnection();
    
    res.status(200).json({
      status: 'success',
      data: {
        connected: isConnected,
        message: isConnected ? 'IPFS daemon is running' : 'IPFS daemon is not running'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message
    });
  }
});

module.exports = router;