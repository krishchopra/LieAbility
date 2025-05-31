const { deployContract, grantEligibility } = require("../src/utils/hedera");
const {
  autoVerifyContract,
  getContractUrl,
} = require("../src/utils/blockscout");
const fs = require("fs");
const path = require("path");

// Mock compiled contract - In real deployment, you'd compile with Solidity compiler
const MOCK_BYTECODE = "0x608060405234801561001057600080fd5b50..."; // This would be your actual compiled bytecode

// Contract source code for verification (flattened)
const CONTRACT_SOURCE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// This would be your flattened contract source
// In practice, use proper flattening tools like:
// - solidity-flattener
// - hardhat flatten
// - truffle-flattener

contract LieAbilityNFT {
    // Your contract code here...
}
`;

async function main() {
  console.log("🚀 Starting LieAbility NFT deployment...");

  try {
    // Deploy the contract
    console.log("📝 Deploying contract to Hedera...");

    const deploymentResult = await deployContract(MOCK_BYTECODE);

    console.log("✅ Contract deployed successfully!");
    console.log("Contract ID:", deploymentResult.contractId);
    console.log("EVM Address:", deploymentResult.evmAddress);
    console.log("File ID:", deploymentResult.fileId);

    // Save deployment info
    const deploymentInfo = {
      contractId: deploymentResult.contractId,
      evmAddress: deploymentResult.evmAddress,
      fileId: deploymentResult.fileId,
      deployedAt: new Date().toISOString(),
      network: "testnet",
      verified: false,
    };

    fs.writeFileSync(
      path.join(__dirname, "../deployment.json"),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("💾 Deployment info saved to deployment.json");

    // Auto-verify on BlockScout
    console.log("\n🔍 Starting contract verification...");
    try {
      await autoVerifyContract(
        deploymentResult.evmAddress,
        CONTRACT_SOURCE,
        "LieAbilityNFT"
      );

      // Update deployment info to mark as verified
      deploymentInfo.verified = true;
      fs.writeFileSync(
        path.join(__dirname, "../deployment.json"),
        JSON.stringify(deploymentInfo, null, 2)
      );
    } catch (verifyError) {
      console.log(
        "⚠️ Auto-verification failed, but contract deployed successfully"
      );
      console.log(
        "You can verify manually later using the verification script"
      );
      console.error("Verification error:", verifyError.message);
    }

    // Instructions for next steps
    console.log("\n📋 Next Steps:");
    console.log("1. Add this to your .env file:");
    console.log(`   VITE_CONTRACT_ADDRESS=${deploymentResult.evmAddress}`);
    console.log(
      "\n2. To grant eligibility to users after they complete interviews:"
    );
    console.log(
      "   - Use the grantEligibility function with user addresses and scores"
    );
    console.log("   - Only users with scores >= 75 will be eligible to mint");
    console.log("\n3. Users can then connect their wallets and mint NFTs");

    console.log("\n4. View your contract:");
    console.log(
      `   📊 Overview: ${getContractUrl(
        deploymentResult.evmAddress,
        "overview"
      )}`
    );
    console.log(
      `   📝 Source Code: ${getContractUrl(
        deploymentResult.evmAddress,
        "contract"
      )}`
    );
    console.log(
      `   📖 Read Contract: ${getContractUrl(
        deploymentResult.evmAddress,
        "read-contract"
      )}`
    );
    console.log(
      `   ✍️ Write Contract: ${getContractUrl(
        deploymentResult.evmAddress,
        "write-contract"
      )}`
    );
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Grant eligibility example function
async function grantEligibilityExample() {
  const deploymentInfo = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../deployment.json"), "utf8")
  );

  // Example: Grant eligibility to test addresses
  const testAddresses = [
    "0x1234567890123456789012345678901234567890", // Replace with real addresses
    "0x0987654321098765432109876543210987654321",
  ];

  const testScores = [85, 92]; // Scores >= 75 are eligible

  try {
    console.log("🎯 Granting eligibility to test addresses...");

    const txId = await grantEligibility(
      deploymentInfo.contractId,
      testAddresses,
      testScores
    );

    console.log("✅ Eligibility granted! Transaction ID:", txId);
  } catch (error) {
    console.error("❌ Failed to grant eligibility:", error);
  }
}

// Manual verification function
async function verifyContractManually() {
  const deploymentInfo = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../deployment.json"), "utf8")
  );

  if (!deploymentInfo.evmAddress) {
    console.error("❌ No contract address found. Deploy first.");
    return;
  }

  console.log("🔍 Verifying contract manually...");

  try {
    await autoVerifyContract(
      deploymentInfo.evmAddress,
      CONTRACT_SOURCE,
      "LieAbilityNFT"
    );

    // Update deployment info
    deploymentInfo.verified = true;
    deploymentInfo.verifiedAt = new Date().toISOString();

    fs.writeFileSync(
      path.join(__dirname, "../deployment.json"),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("✅ Contract verification completed!");
  } catch (error) {
    console.error("❌ Manual verification failed:", error);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Ensure the contract source matches exactly");
    console.log("2. Check compiler version and optimization settings");
    console.log("3. Try manual verification via HashScan interface");
  }
}

// Run deployment
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case "verify":
      verifyContractManually();
      break;
    case "grant-eligibility":
      grantEligibilityExample();
      break;
    default:
      main();
  }
}

module.exports = { main, grantEligibilityExample, verifyContractManually };
