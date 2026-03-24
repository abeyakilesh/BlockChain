const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * IPFS Service
 * Uses Pinata in production, local simulation in development
 */
class IPFSService {
  constructor() {
    this.simulationMode = !process.env.PINATA_API_KEY;
    this.gateway = process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud';
  }

  /**
   * Upload file to IPFS
   */
  async uploadFile(filePath) {
    if (this.simulationMode) {
      return this._simulateUpload(filePath);
    }

    return this._pinataUpload(filePath);
  }

  /**
   * Upload JSON metadata to IPFS
   */
  async uploadJSON(data) {
    if (this.simulationMode) {
      const content = JSON.stringify(data);
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      const cid = `QmSim${hash.substring(0, 40)}`;
      return { cid, url: `${this.gateway}/ipfs/${cid}` };
    }

    return this._pinataUploadJSON(data);
  }

  /**
   * Simulated IPFS upload (development mode)
   */
  async _simulateUpload(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const cid = `QmSim${hash.substring(0, 40)}`;

    // Copy to a "simulated IPFS" directory
    const ipfsDir = path.join(__dirname, '../../uploads/ipfs');
    if (!fs.existsSync(ipfsDir)) fs.mkdirSync(ipfsDir, { recursive: true });

    const ext = path.extname(filePath);
    fs.copyFileSync(filePath, path.join(ipfsDir, `${cid}${ext}`));

    return {
      cid,
      url: `${this.gateway}/ipfs/${cid}`,
      localUrl: `/uploads/ipfs/${cid}${ext}`,
      simulated: true,
    };
  }

  /**
   * Pinata upload (production)
   */
  async _pinataUpload(filePath) {
    const fetch = global.fetch || require('node-fetch');
    const FormData = require('form-data');

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_KEY,
      },
      body: formData,
    });

    const data = await response.json();
    return {
      cid: data.IpfsHash,
      url: `${this.gateway}/ipfs/${data.IpfsHash}`,
      simulated: false,
    };
  }

  /**
   * Pinata JSON upload
   */
  async _pinataUploadJSON(data) {
    const fetch = global.fetch || require('node-fetch');

    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_KEY,
      },
      body: JSON.stringify({ pinataContent: data }),
    });

    const result = await response.json();
    return {
      cid: result.IpfsHash,
      url: `${this.gateway}/ipfs/${result.IpfsHash}`,
      simulated: false,
    };
  }
}

module.exports = new IPFSService();
