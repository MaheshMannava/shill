// scripts/deploy.ts
import { ethers, run } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // Set constructor parameters
  const eventDuration = 7 * 24 * 60 * 60; // 7 days in seconds
  const creatorShare = 30; // 30% for creator, 70% for voters

  const CROPFactory = await ethers.getContractFactory("CROP");
  const crop = await CROPFactory.deploy(eventDuration, creatorShare);
  await crop.waitForDeployment();
  const cropAddress = await crop.getAddress();

  console.log("CROP deployed to:", cropAddress);
  console.log("Event Duration:", eventDuration, "seconds");
  console.log("Creator Share:", creatorShare, "%");

  // Verify contract
  if (process.env.CORN_ETHERSCAN_API_KEY) {
    console.log("Verifying contract...");
    try {
      await run("verify:verify", {
        address: cropAddress,
        constructorArguments: [eventDuration, creatorShare],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.error("Error verifying contract:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });