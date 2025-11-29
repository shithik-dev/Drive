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
    const { folderId = 'root' } = req.body;
    const { signature, message } = req.headers;

    // Verify signature
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
    const ipfsResult = await ipfsService.uploadFile(file.buffer);

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

    res.status(200).json({
      status: 'success',
      data: {
        file: fileData,
        transaction: blockchainResult
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

router.post('/folder', async (req, res) => {
  try {
    const { folderName } = req.body;
    const { signature, message } = req.headers;

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

module.exports = router;