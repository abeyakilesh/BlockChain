const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CreatorRights", function () {
  let creatorRights, owner, creator, buyer, addr3;

  beforeEach(async function () {
    [owner, creator, buyer, addr3] = await ethers.getSigners();
    const CreatorRights = await ethers.getContractFactory("CreatorRights");
    creatorRights = await CreatorRights.deploy();
    await creatorRights.waitForDeployment();
  });

  const sampleContentId = ethers.keccak256(ethers.toUtf8Bytes("content-001"));
  const sampleFingerprint = ethers.keccak256(ethers.toUtf8Bytes("phash-abc123"));
  const sampleTermsURI = "ipfs://QmTermsHash123";
  const royaltyBps = 1000; // 10%

  describe("Registration", function () {
    it("should register content rights", async function () {
      await expect(
        creatorRights.connect(creator).registerRights(
          sampleContentId, sampleFingerprint, sampleTermsURI, royaltyBps
        )
      ).to.emit(creatorRights, "RightsRegistered")
       .withArgs(sampleContentId, creator.address, sampleFingerprint, sampleTermsURI, royaltyBps, anyValue);

      const record = await creatorRights.getRecord(sampleContentId);
      expect(record.owner).to.equal(creator.address);
      expect(record.fingerprintHash).to.equal(sampleFingerprint);
      expect(record.royaltyBps).to.equal(royaltyBps);
      expect(record.exists).to.be.true;
    });

    it("should reject duplicate content registration", async function () {
      await creatorRights.connect(creator).registerRights(
        sampleContentId, sampleFingerprint, sampleTermsURI, royaltyBps
      );
      await expect(
        creatorRights.connect(creator).registerRights(
          sampleContentId, sampleFingerprint, sampleTermsURI, royaltyBps
        )
      ).to.be.revertedWithCustomError(creatorRights, "ContentAlreadyRegistered");
    });

    it("should reject royalty > 50%", async function () {
      await expect(
        creatorRights.connect(creator).registerRights(
          sampleContentId, sampleFingerprint, sampleTermsURI, 5001
        )
      ).to.be.revertedWithCustomError(creatorRights, "InvalidRoyaltyBps");
    });

    it("should verify ownership", async function () {
      await creatorRights.connect(creator).registerRights(
        sampleContentId, sampleFingerprint, sampleTermsURI, royaltyBps
      );
      expect(await creatorRights.verifyOwnership(sampleContentId, creator.address)).to.be.true;
      expect(await creatorRights.verifyOwnership(sampleContentId, buyer.address)).to.be.false;
    });
  });

  describe("Licensing", function () {
    beforeEach(async function () {
      await creatorRights.connect(creator).registerRights(
        sampleContentId, sampleFingerprint, sampleTermsURI, royaltyBps
      );
    });

    it("should grant license and pay royalty", async function () {
      const price = ethers.parseEther("1.0");
      const creatorBalanceBefore = await ethers.provider.getBalance(creator.address);

      await expect(
        creatorRights.connect(buyer).licenseTo(sampleContentId, { value: price })
      ).to.emit(creatorRights, "LicenseGranted");

      expect(await creatorRights.hasLicense(sampleContentId, buyer.address)).to.be.true;

      const creatorBalanceAfter = await ethers.provider.getBalance(creator.address);
      const royaltyReceived = creatorBalanceAfter - creatorBalanceBefore;
      expect(royaltyReceived).to.equal(ethers.parseEther("0.1")); // 10%
    });

    it("should reject duplicate license", async function () {
      const price = ethers.parseEther("0.5");
      await creatorRights.connect(buyer).licenseTo(sampleContentId, { value: price });
      await expect(
        creatorRights.connect(buyer).licenseTo(sampleContentId, { value: price })
      ).to.be.revertedWithCustomError(creatorRights, "AlreadyLicensed");
    });

    it("should reject license for non-existent content", async function () {
      const fakeId = ethers.keccak256(ethers.toUtf8Bytes("fake"));
      await expect(
        creatorRights.connect(buyer).licenseTo(fakeId, { value: 100 })
      ).to.be.revertedWithCustomError(creatorRights, "ContentNotFound");
    });

    it("should track license count", async function () {
      await creatorRights.connect(buyer).licenseTo(sampleContentId, { value: 100 });
      await creatorRights.connect(addr3).licenseTo(sampleContentId, { value: 100 });
      expect(await creatorRights.licenseCount(sampleContentId)).to.equal(2);
    });
  });
});

function anyValue() { return true; }
