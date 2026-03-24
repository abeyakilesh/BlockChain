const { ethers } = require('ethers');

// Contract ABIs (minimal for function calls)
const CREATOR_RIGHTS_ABI = [
  'function registerRights(bytes32 contentId, bytes32 fingerprintHash, string termsURI, uint96 royaltyBps)',
  'function licenseTo(bytes32 contentId) payable',
  'function hasLicense(bytes32 contentId, address user) view returns (bool)',
  'function getRecord(bytes32 contentId) view returns (tuple(address owner, bytes32 fingerprintHash, string termsURI, uint96 royaltyBps, uint256 registeredAt, bool exists))',
  'function verifyOwnership(bytes32 contentId, address claimedOwner) view returns (bool)',
  'event RightsRegistered(bytes32 indexed contentId, address indexed owner, bytes32 fingerprintHash, string termsURI, uint96 royaltyBps, uint256 timestamp)',
  'event LicenseGranted(bytes32 indexed contentId, address indexed licensee, uint256 amount, uint256 timestamp)',
];

const ROYALTY_DISTRIBUTOR_ABI = [
  'function updateMerkleRoot(bytes32 root)',
  'function claim(uint256 cumulativeAmount, bytes32[] proof)',
  'function deposit() payable',
  'function merkleRoot() view returns (bytes32)',
  'function currentEpoch() view returns (uint256)',
  'function totalClaimed(address) view returns (uint256)',
  'function getContractBalance() view returns (uint256)',
];

class BlockchainService {
  constructor() {
    this.initialized = false;
    this.simulationMode = true;
  }

  /**
   * Initialize blockchain connection
   */
  init() {
    try {
      const rpcUrl = process.env.POLYGON_RPC_URL;
      const privateKey = process.env.PRIVATE_KEY;
      const rightsAddress = process.env.CREATOR_RIGHTS_ADDRESS;
      const distributorAddress = process.env.ROYALTY_DISTRIBUTOR_ADDRESS;

      if (!rpcUrl || !privateKey || !rightsAddress || !distributorAddress) {
        console.log('⚠️  Blockchain config incomplete — running in simulation mode');
        this.simulationMode = true;
        return;
      }

      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      this.creatorRights = new ethers.Contract(rightsAddress, CREATOR_RIGHTS_ABI, this.wallet);
      this.royaltyDistributor = new ethers.Contract(distributorAddress, ROYALTY_DISTRIBUTOR_ABI, this.wallet);

      this.simulationMode = false;
      this.initialized = true;
      console.log('✅ Blockchain service initialized');
    } catch (err) {
      console.log('⚠️  Blockchain init failed — running in simulation mode:', err.message);
      this.simulationMode = true;
    }
  }

  /**
   * Register content rights on-chain
   */
  async registerRights(contentId, fingerprintHash, termsURI, royaltyBps = 1000) {
    if (this.simulationMode) {
      // Simulate transaction
      const simulatedTxHash = '0x' + Buffer.from(
        `sim_register_${contentId}_${Date.now()}`
      ).toString('hex').substring(0, 64);

      return {
        txHash: simulatedTxHash,
        blockNumber: Math.floor(Math.random() * 1000000) + 50000000,
        simulated: true,
      };
    }

    const tx = await this.creatorRights.registerRights(
      contentId, fingerprintHash, termsURI, royaltyBps
    );
    const receipt = await tx.wait();

    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      simulated: false,
    };
  }

  /**
   * License content on-chain
   */
  async licenseTo(contentHash, price) {
    if (this.simulationMode) {
      return '0x' + Buffer.from(
        `sim_license_${contentHash}_${Date.now()}`
      ).toString('hex').substring(0, 64);
    }

    const priceWei = ethers.parseEther(price.toString());
    const tx = await this.creatorRights.licenseTo(contentHash, { value: priceWei });
    const receipt = await tx.wait();
    return receipt.hash;
  }

  /**
   * Update Merkle root for royalty distribution
   */
  async updateMerkleRoot(root) {
    if (this.simulationMode) {
      return '0x' + Buffer.from(
        `sim_merkle_${Date.now()}`
      ).toString('hex').substring(0, 64);
    }

    const tx = await this.royaltyDistributor.updateMerkleRoot(root);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  /**
   * Generate content hash (bytes32) from CID
   */
  generateContentHash(cid) {
    return ethers.keccak256(ethers.toUtf8Bytes(cid));
  }

  /**
   * Generate fingerprint hash (bytes32)
   */
  generateFingerprintHash(fingerprint) {
    return ethers.keccak256(ethers.toUtf8Bytes(fingerprint));
  }
}

module.exports = new BlockchainService();
