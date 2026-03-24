const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");

// Helper: create leaf for Merkle tree (matches contract encoding)
function createLeaf(address, amount) {
  const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
    ["address", "uint256"],
    [address, amount]
  );
  return ethers.keccak256(ethers.keccak256(encoded));
}

describe("RoyaltyDistributor", function () {
  let distributor, owner, alice, bob, charlie;

  beforeEach(async function () {
    [owner, alice, bob, charlie] = await ethers.getSigners();
    const RoyaltyDistributor = await ethers.getContractFactory("RoyaltyDistributor");
    distributor = await RoyaltyDistributor.deploy();
    await distributor.waitForDeployment();
  });

  describe("Merkle Root Management", function () {
    it("should update Merkle root", async function () {
      const root = ethers.keccak256(ethers.toUtf8Bytes("test-root"));
      await expect(distributor.updateMerkleRoot(root))
        .to.emit(distributor, "MerkleRootUpdated")
        .withArgs(root, 1, anyValue);

      expect(await distributor.merkleRoot()).to.equal(root);
      expect(await distributor.currentEpoch()).to.equal(1);
    });

    it("should reject zero root", async function () {
      await expect(
        distributor.updateMerkleRoot(ethers.ZeroHash)
      ).to.be.revertedWithCustomError(distributor, "ZeroRoot");
    });

    it("should only allow owner to update root", async function () {
      const root = ethers.keccak256(ethers.toUtf8Bytes("test"));
      await expect(
        distributor.connect(alice).updateMerkleRoot(root)
      ).to.be.revertedWithCustomError(distributor, "OwnableUnauthorizedAccount");
    });
  });

  describe("Claims with Merkle Proof", function () {
    let tree, root;
    const aliceAmount = ethers.parseEther("5");
    const bobAmount = ethers.parseEther("3");

    beforeEach(async function () {
      // Build Merkle tree
      const leaves = [
        createLeaf(alice.address, aliceAmount),
        createLeaf(bob.address, bobAmount),
      ];

      tree = new MerkleTree(leaves, ethers.keccak256, { sortPairs: true });
      root = "0x" + tree.getRoot().toString("hex");

      // Set root and fund contract
      await distributor.updateMerkleRoot(root);
      await distributor.deposit({ value: ethers.parseEther("10") });
    });

    it("should allow valid claim", async function () {
      const leaf = createLeaf(alice.address, aliceAmount);
      const proof = tree.getHexProof(leaf);

      const balanceBefore = await ethers.provider.getBalance(alice.address);
      const tx = await distributor.connect(alice).claim(aliceAmount, proof);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(alice.address);
      expect(balanceAfter - balanceBefore + gasUsed).to.equal(aliceAmount);
      expect(await distributor.totalClaimed(alice.address)).to.equal(aliceAmount);
    });

    it("should reject invalid proof", async function () {
      const fakeProof = [ethers.keccak256(ethers.toUtf8Bytes("fake"))];
      await expect(
        distributor.connect(alice).claim(aliceAmount, fakeProof)
      ).to.be.revertedWithCustomError(distributor, "InvalidProof");
    });

    it("should reject double claim", async function () {
      const leaf = createLeaf(alice.address, aliceAmount);
      const proof = tree.getHexProof(leaf);

      await distributor.connect(alice).claim(aliceAmount, proof);
      await expect(
        distributor.connect(alice).claim(aliceAmount, proof)
      ).to.be.revertedWithCustomError(distributor, "NothingToClaim");
    });

    it("should allow incremental claims across epochs", async function () {
      // Epoch 1: Alice claims 5 ETH
      const leaf1 = createLeaf(alice.address, aliceAmount);
      const proof1 = tree.getHexProof(leaf1);
      await distributor.connect(alice).claim(aliceAmount, proof1);

      // Epoch 2: Alice has 8 ETH total (3 ETH new)
      const newAliceAmount = ethers.parseEther("8");
      const newLeaves = [
        createLeaf(alice.address, newAliceAmount),
        createLeaf(bob.address, bobAmount),
      ];
      const newTree = new MerkleTree(newLeaves, ethers.keccak256, { sortPairs: true });
      const newRoot = "0x" + newTree.getRoot().toString("hex");

      await distributor.updateMerkleRoot(newRoot);
      await distributor.deposit({ value: ethers.parseEther("5") });

      const leaf2 = createLeaf(alice.address, newAliceAmount);
      const proof2 = newTree.getHexProof(leaf2);

      const balanceBefore = await ethers.provider.getBalance(alice.address);
      const tx = await distributor.connect(alice).claim(newAliceAmount, proof2);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(alice.address);
      // Should get 3 ETH (8 - 5 already claimed)
      expect(balanceAfter - balanceBefore + gasUsed).to.equal(ethers.parseEther("3"));
    });
  });

  describe("Funding", function () {
    it("should accept deposits", async function () {
      const amount = ethers.parseEther("10");
      await expect(distributor.deposit({ value: amount }))
        .to.emit(distributor, "FundsDeposited");
      expect(await distributor.getContractBalance()).to.equal(amount);
    });

    it("should accept direct transfers", async function () {
      const amount = ethers.parseEther("1");
      await owner.sendTransaction({
        to: await distributor.getAddress(),
        value: amount,
      });
      expect(await distributor.getContractBalance()).to.equal(amount);
    });
  });
});

function anyValue() { return true; }
