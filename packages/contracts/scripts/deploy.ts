import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying VisionToken with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  const VisionToken = await ethers.getContractFactory("VisionToken");
  const token = await VisionToken.deploy(deployer.address);

  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log("VisionToken deployed to:", address);

  // Verify the contract if on a network with Etherscan
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block confirmations...");
    await token.deploymentTransaction()?.wait(5);

    console.log("Verifying contract...");
    const { run } = require("hardhat");
    await run("verify:verify", {
      address: address,
      constructorArguments: [deployer.address],
    });
  }

  console.log("\nDeployment complete!");
  console.log("Add this to your .env file:");
  console.log(`TOKEN_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
