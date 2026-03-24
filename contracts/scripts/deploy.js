const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying CreatorChain contracts...\n");

  // Deploy CreatorRights
  const CreatorRights = await hre.ethers.getContractFactory("CreatorRights");
  const creatorRights = await CreatorRights.deploy();
  await creatorRights.waitForDeployment();
  const rightsAddress = await creatorRights.getAddress();
  console.log(`✅ CreatorRights deployed to: ${rightsAddress}`);

  // Deploy RoyaltyDistributor
  const RoyaltyDistributor = await hre.ethers.getContractFactory("RoyaltyDistributor");
  const royaltyDistributor = await RoyaltyDistributor.deploy();
  await royaltyDistributor.waitForDeployment();
  const distributorAddress = await royaltyDistributor.getAddress();
  console.log(`✅ RoyaltyDistributor deployed to: ${distributorAddress}`);

  console.log("\n📋 Deployment Summary:");
  console.log(`   CREATOR_RIGHTS_ADDRESS=${rightsAddress}`);
  console.log(`   ROYALTY_DISTRIBUTOR_ADDRESS=${distributorAddress}`);
  console.log("\n💡 Add these addresses to your .env file");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
