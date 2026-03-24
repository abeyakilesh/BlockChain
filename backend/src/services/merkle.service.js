const { ethers } = require('ethers');
const { MerkleTree } = require('merkletreejs');

/**
 * Merkle Tree Service for scalable royalty distribution
 */
class MerkleService {
  constructor() {
    this.currentTree = null;
    this.currentRoot = null;
    this.currentEpoch = 0;
    this.proofs = {};
  }

  /**
   * Generate Merkle root from earnings data
   * @param {Array} earnings - [{wallet_address, total_earned}]
   */
  async generateMerkleRoot(earnings) {
    // Create leaves: keccak256(keccak256(abi.encode(address, amount)))
    const leaves = earnings.map(e => this._createLeaf(
      e.wallet_address,
      ethers.parseEther(e.total_earned.toString())
    ));

    // Build tree
    this.currentTree = new MerkleTree(leaves, ethers.keccak256, { sortPairs: true });
    this.currentRoot = '0x' + this.currentTree.getRoot().toString('hex');
    this.currentEpoch++;

    // Generate proofs for each creator
    const proofs = {};
    earnings.forEach((e, i) => {
      const leaf = leaves[i];
      proofs[e.wallet_address] = {
        amount: e.total_earned.toString(),
        amountWei: ethers.parseEther(e.total_earned.toString()).toString(),
        proof: this.currentTree.getHexProof(leaf),
      };
    });

    this.proofs = proofs;

    return {
      root: this.currentRoot,
      epoch: this.currentEpoch,
      proofs,
    };
  }

  /**
   * Get proof for a specific address
   */
  getProof(walletAddress) {
    return this.proofs[walletAddress] || null;
  }

  /**
   * Verify a claim locally
   */
  async verifyClaim(walletAddress, amount, proof) {
    try {
      const amountWei = ethers.parseEther(amount.toString());
      const leaf = this._createLeaf(walletAddress, amountWei);
      const root = this.currentRoot;

      const valid = this.currentTree
        ? this.currentTree.verify(proof, leaf, this.currentTree.getRoot())
        : false;

      return {
        valid,
        epoch: this.currentEpoch,
        txHash: valid
          ? '0x' + Buffer.from(`claim_${walletAddress}_${Date.now()}`).toString('hex').substring(0, 64)
          : null,
      };
    } catch (err) {
      return { valid: false, error: err.message };
    }
  }

  /**
   * Create leaf hash matching contract encoding
   */
  _createLeaf(address, amountWei) {
    const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
      ['address', 'uint256'],
      [address, amountWei]
    );
    return ethers.keccak256(ethers.keccak256(encoded));
  }
}

module.exports = new MerkleService();
