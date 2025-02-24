import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";

// Helper function to handle BigInt serialization
function formatForJson(obj: any): any {
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(formatForJson);
  }
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, formatForJson(value)])
    );
  }
  return obj;
}

async function main() {
  try {
    console.log("\n---------------------");
    console.log("📝 Starting Deployment");
    console.log("---------------------\n");

    // Get network info
    const { name, chainId } = await ethers.provider.getNetwork();
    console.log(`🌐 Network: ${name}`);
    console.log(`⛓️ Chain ID: ${chainId}`);

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    const deployerBalance = await ethers.provider.getBalance(deployerAddress);
    
    console.log("\n👤 Deployer Info:");
    console.log(`   Address: ${deployerAddress}`);
    console.log(`   Balance: ${ethers.formatEther(deployerBalance)} ETH\n`);

    // Deploy CropCircle contract
    console.log("🚀 Deploying CropCircle contract...");
    const CropCircle = await ethers.getContractFactory("CropCircle");
    const cropCircle = await CropCircle.deploy();
    
    console.log("⏳ Waiting for deployment confirmation...");
    await cropCircle.waitForDeployment();
    const contractAddress = await cropCircle.getAddress();

    // Wait for additional confirmations
    console.log("⏳ Waiting for additional block confirmations...");
    const deploymentReceipt = await cropCircle.deploymentTransaction()?.wait(5);
    
    console.log(`✅ CropCircle deployed to: ${contractAddress}`);
    console.log(`   Transaction Hash: ${deploymentReceipt?.hash}`);
    console.log(`   Block Number: ${deploymentReceipt?.blockNumber}\n`);

    // Save deployment info
    const deploymentInfo = {
      network: name,
      chainId: chainId.toString(), // Convert BigInt to string
      contractAddress: contractAddress,
      deployerAddress: deployerAddress,
      deploymentTime: new Date().toISOString(),
      blockNumber: deploymentReceipt?.blockNumber?.toString(), // Convert BigInt to string
      transactionHash: deploymentReceipt?.hash
    };

    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir);
    }

    // Save deployment info to network-specific file
    const deploymentPath = path.join(deploymentsDir, `${name}.json`);
    fs.writeFileSync(
      deploymentPath,
      JSON.stringify(formatForJson(deploymentInfo), null, 2)
    );
    console.log(`📄 Deployment info saved to: ${deploymentPath}\n`);

    // Print verification command
    console.log("🔍 To verify the contract on block explorer, run:");
    console.log("---------------------------------------------");
    console.log(`npx hardhat verify --network ${network.name} ${contractAddress}`);
    console.log("---------------------------------------------\n");

    console.log("✨ Deployment completed successfully!");
    console.log("---------------------\n");

  } catch (error) {
    console.error("\n❌ Deployment failed!");
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });