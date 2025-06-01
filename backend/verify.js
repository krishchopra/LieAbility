const fs = require("fs");
const path = require("path");

function checkDeployment() {
  console.log("🔍 Contract Verification & Status Check");
  console.log("=====================================");

  // Check if deployment info exists
  const deploymentPath = path.join(__dirname, "deployment.json");

  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ deployment.json not found. Deploy the contract first.");
    console.log("Run: npm run deploy");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

  if (!deploymentInfo.contractId || !deploymentInfo.evmAddress) {
    console.error("❌ Invalid deployment info found");
    process.exit(1);
  }

  console.log("✅ Contract deployment found:");
  console.log(`📄 Contract ID: ${deploymentInfo.contractId}`);
  console.log(`🏠 EVM Address: ${deploymentInfo.evmAddress}`);
  console.log(`📅 Deployed: ${deploymentInfo.deployedAt}`);
  console.log(`🌐 Network: ${deploymentInfo.network}`);

  // Show useful links
  console.log("\n🔗 Useful Links:");
  console.log(
    `📊 HashScan Overview: https://hashscan.io/testnet/contract/${deploymentInfo.contractId}`
  );
  console.log(
    `📝 Contract Details: https://hashscan.io/testnet/contract/${deploymentInfo.contractId}`
  );
  console.log(
    `🔍 Transactions: https://hashscan.io/testnet/contract/${deploymentInfo.contractId}/transactions`
  );

  console.log("\n📋 Environment Setup:");
  console.log("Add this to your backend/.env file:");
  console.log(`CONTRACT_ID=${deploymentInfo.contractId}`);

  console.log("\n🎯 Next Steps:");
  console.log("1. Ensure your backend/.env has the CONTRACT_ID");
  console.log("2. Start your backend server: npm start");
  console.log("3. Test the /health endpoint to verify connection");

  return deploymentInfo;
}

// Run check
if (require.main === module) {
  checkDeployment();
}

module.exports = { checkDeployment };
