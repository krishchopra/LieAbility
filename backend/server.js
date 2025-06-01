const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

const {
  Client,
  ContractExecuteTransaction,
  AccountId,
  PrivateKey,
  ContractId,
} = require("@hashgraph/sdk");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:8080",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);
app.use(express.json());

// Initialize Hedera client
let client;
try {
  const accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
  const privateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);

  if (process.env.HEDERA_NETWORK === "testnet") {
    client = Client.forTestnet();
  } else if (process.env.HEDERA_NETWORK === "mainnet") {
    client = Client.forMainnet();
  } else {
    client = Client.forTestnet(); // default to testnet
  }

  client.setOperator(accountId, privateKey);
  console.log("✅ Hedera client initialized");
} catch (error) {
  console.error("❌ Failed to initialize Hedera client:", error.message);
}

// Contract configuration
const contractId = ContractId.fromString(process.env.CONTRACT_ID);

// Utility function to generate deterministic score signature
function generateScoreSignature(userAddress, score, timestamp) {
  if (!process.env.ASSESSMENT_PRIVATE_KEY) {
    throw new Error("Assessment private key not configured");
  }

  // Create message hash (same format as frontend was using)
  const message = `LieAbility Assessment - Address: ${userAddress}, Score: ${score}, Timestamp: ${timestamp}`;
  const messageHash = crypto.createHash("sha256").update(message).digest();

  // Sign with server's private key
  const privateKey = Buffer.from(
    process.env.ASSESSMENT_PRIVATE_KEY.replace("0x", ""),
    "hex"
  );
  const signature = crypto.sign("sha256", messageHash, {
    key: privateKey,
    format: "der",
    type: "sec1",
  });

  return {
    message,
    signature: "0x" + signature.toString("hex"),
    timestamp,
  };
}

// Routes

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    hedera: client ? "connected" : "disconnected",
  });
});

// Submit assessment and get eligibility
app.post("/api/submit-assessment", async (req, res) => {
  try {
    const { userAddress, trustScore } = req.body;

    // Validate input
    if (!userAddress || !trustScore) {
      return res.status(400).json({
        success: false,
        error: "Missing userAddress or trustScore",
      });
    }

    // Validate address format (basic check)
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        success: false,
        error: "Invalid address format",
      });
    }

    // Check if score qualifies (≥75)
    if (trustScore < 75) {
      return res.status(400).json({
        success: false,
        error: "Score does not meet minimum requirement (75)",
      });
    }

    console.log(
      `📝 Processing assessment for ${userAddress} with score ${trustScore}`
    );

    // Generate signature for verification
    const timestamp = Math.floor(Date.now() / 1000);
    const verification = generateScoreSignature(
      userAddress,
      trustScore,
      timestamp
    );

    // Grant eligibility on smart contract
    try {
      if (!client) {
        throw new Error("Hedera client not initialized");
      }

      const transaction = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("grantEligibility", [userAddress, trustScore]);

      const txResponse = await transaction.execute(client);
      const receipt = await txResponse.getReceipt(client);

      if (receipt.status.toString() !== "SUCCESS") {
        throw new Error(`Transaction failed: ${receipt.status.toString()}`);
      }

      console.log(`✅ Eligibility granted for ${userAddress}`);

      res.json({
        success: true,
        message: "Assessment verified and eligibility granted",
        data: {
          userAddress,
          trustScore,
          timestamp,
          transactionId: txResponse.transactionId.toString(),
          verification,
        },
      });
    } catch (contractError) {
      console.error("❌ Contract transaction failed:", contractError);

      // Still return the verification for potential manual processing
      res.status(500).json({
        success: false,
        error: "Failed to grant eligibility on blockchain",
        details: contractError.message,
        verification, // Include for debugging
      });
    }
  } catch (error) {
    console.error("❌ Assessment submission error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
});

// Get eligibility status
app.get("/api/eligibility/:address", async (req, res) => {
  try {
    const { address } = req.params;

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        success: false,
        error: "Invalid address format",
      });
    }

    // Note: This would require a view function on the contract
    // For now, return a simple response
    res.json({
      success: true,
      data: {
        address,
        message:
          "Check eligibility directly on the blockchain via your frontend",
      },
    });
  } catch (error) {
    console.error("❌ Eligibility check error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("❌ Unhandled error:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LieAbility Backend running on port ${PORT}`);
  console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🔗 Contract ID: ${process.env.CONTRACT_ID}`);
});

module.exports = app;
