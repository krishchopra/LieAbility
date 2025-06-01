const {
  Client,
  ContractCreateFlow,
  PrivateKey,
  AccountId,
} = require("@hashgraph/sdk");
const fs = require("fs");
const solc = require("solc");
const path = require("path");
require("dotenv").config();

// Compile the smart contract
function compileContract() {
  console.log("📝 Compiling LieAbilityNFTSimple contract...");

  // Read the contract source
  const contractPath = path.join(
    __dirname,
    "..",
    "contracts",
    "LieAbilityNFTSimple.sol"
  );
  const contractSource = fs.readFileSync(contractPath, "utf8");

  const input = {
    language: "Solidity",
    sources: {
      "contracts/LieAbilityNFTSimple.sol": { content: contractSource },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    output.errors.forEach((error) => {
      if (error.severity === "error") {
        console.error("❌ Compilation error:", error.formattedMessage);
        process.exit(1);
      } else {
        console.warn("⚠️ Compilation warning:", error.formattedMessage);
      }
    });
  }

  const contract =
    output.contracts["contracts/LieAbilityNFTSimple.sol"][
      "LieAbilityNFTSimple"
    ];
  console.log("✅ Contract compiled successfully!");

  return {
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object,
  };
}

async function deployContract() {
  console.log("🚀 Starting deployment to Hedera Testnet...");

  // Environment validation
  if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
    console.error(
      "❌ Missing required environment variables: HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY"
    );
    process.exit(1);
  }

  try {
    // Compile contract
    const { abi, bytecode } = compileContract();

    // Create Hedera client
    const client = Client.forTestnet();
    client.setOperator(
      AccountId.fromString(process.env.HEDERA_ACCOUNT_ID),
      PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY)
    );

    console.log("🔗 Connected to Hedera Testnet");
    console.log("👤 Using account:", process.env.HEDERA_ACCOUNT_ID);

    // Deploy using ContractCreateFlow (simpler approach)
    console.log("🚀 Deploying contract...");

    const contractCreateTx = new ContractCreateFlow()
      .setBytecode(bytecode)
      .setGas(2000000) // 2M gas units
      .setConstructorParameters(); // No constructor parameters needed

    const contractCreateSubmit = await contractCreateTx.execute(client);
    const contractCreateRx = await contractCreateSubmit.getReceipt(client);

    const contractId = contractCreateRx.contractId;
    const contractAddress = contractId.toSolidityAddress();

    console.log("✅ Contract deployed successfully!");
    console.log("📄 Contract ID:", contractId.toString());
    console.log("🏠 EVM Address:", "0x" + contractAddress);

    console.log("\n📋 Next Steps:");
    console.log("1. Update your backend/.env file:");
    console.log(`   CONTRACT_ID=${contractId.toString()}`);
    console.log("\n2. Update your frontend/.env file:");
    console.log(`   VITE_CONTRACT_ADDRESS=0x${contractAddress}`);
    console.log("\n3. View your contract on HashScan:");
    console.log(
      `   https://hashscan.io/testnet/contract/${contractId.toString()}`
    );

    client.close();
    return contractId.toString();
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Run deployment
if (require.main === module) {
  deployContract();
}

module.exports = { deployContract };
