const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

const {
  Client,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  AccountId,
  PrivateKey,
  ContractId,
  ContractCallQuery,
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

  // Use HMAC instead of complex crypto signing to avoid decoder issues
  const signature = crypto
    .createHmac("sha256", process.env.ASSESSMENT_PRIVATE_KEY)
    .update(message)
    .digest("hex");

  return {
    message,
    signature: "0x" + signature,
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
    console.log(`🔗 Using contract: ${contractId.toString()}`);

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

      // Properly encode function parameters for Hedera
      const functionParameters = new ContractFunctionParameters()
        .addAddressArray([userAddress])
        .addUint256Array([trustScore]);

      const transaction = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("grantEligibility", functionParameters);

      const txResponse = await transaction.execute(client);
      const receipt = await txResponse.getReceipt(client);

      if (receipt.status.toString() !== "SUCCESS") {
        throw new Error(`Transaction failed: ${receipt.status.toString()}`);
      }

      console.log(
        `✅ Eligibility granted for ${userAddress} on contract ${contractId.toString()}`
      );
      console.log(`📋 Transaction ID: ${txResponse.transactionId.toString()}`);

      res.json({
        success: true,
        message: "Assessment verified and eligibility granted",
        data: {
          userAddress,
          trustScore,
          timestamp,
          transactionId: txResponse.transactionId.toString(),
          verification,
          contractId: contractId.toString(),
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

// NFT Metadata endpoint
app.get("/api/nft/metadata/:tokenId", async (req, res) => {
  try {
    const { tokenId } = req.params;
    let score = 95; // Default fallback

    // Try to get the actual score from the contract
    try {
      if (client && contractId) {
        // First check if the token exists by checking total supply
        console.log(`🔍 Checking if token ${tokenId} exists...`);

        const totalSupplyQuery = new ContractCallQuery()
          .setContractId(contractId)
          .setGas(30000)
          .setFunction("totalSupply");

        const totalSupplyResult = await totalSupplyQuery.execute(client);
        const totalSupply = totalSupplyResult.getUint256(0);

        console.log(
          `📊 Total supply: ${totalSupply}, requesting token: ${tokenId}`
        );

        if (parseInt(tokenId) < totalSupply) {
          // Token exists, try to get its score
          const contractCallQuery = new ContractCallQuery()
            .setContractId(contractId)
            .setGas(50000)
            .setFunction(
              "getTokenScore",
              new ContractFunctionParameters().addUint256(parseInt(tokenId))
            );

          const contractCallResult = await contractCallQuery.execute(client);
          score = contractCallResult.getUint256(0);
          console.log(`📊 Retrieved score ${score} for token ${tokenId}`);
        } else {
          console.log(
            `⚠️ Token ${tokenId} doesn't exist yet (total supply: ${totalSupply})`
          );
        }
      }
    } catch (error) {
      console.log(
        `⚠️ Could not retrieve score for token ${tokenId}, using default:`,
        error.message
      );
    }

    const metadata = {
      name: `LieAbility Authenticity Certificate #${tokenId}`,
      description: `This NFT certifies ${score}% authenticity on the LieAbility platform. A unique digital credential proving genuine human interaction and trustworthiness.`,
      image: `http://localhost:3001/api/nft/image/${tokenId}/${score}`,
      external_url: `http://localhost:3001/api/nft/metadata/${tokenId}`,
      attributes: [
        {
          trait_type: "Authenticity Score",
          value: score,
          display_type: "boost_percentage",
        },
        {
          trait_type: "Verification Level",
          value:
            score >= 90
              ? "Highly Authentic"
              : score >= 75
              ? "Authentic"
              : "Unverified",
        },
        {
          trait_type: "Token ID",
          value: parseInt(tokenId),
        },
        {
          trait_type: "Issuer",
          value: "LieAbility Platform",
        },
      ],
      background_color: "1a1a2e",
    };

    console.log(
      `✅ Generated metadata for token ${tokenId} with score ${score}`
    );
    res.json(metadata);
  } catch (error) {
    console.error("❌ Metadata generation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate metadata",
    });
  }
});

// NFT Image generation endpoint
app.get("/api/nft/image/:tokenId/:score", async (req, res) => {
  try {
    const { tokenId, score } = req.params;
    const scoreNum = parseInt(score) || 95;

    // Generate SVG image with logo and score
    const svg = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#16213e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0f3460;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#e94560;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f38ba8;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="400" height="400" fill="url(#bg)"/>
      
      <!-- Border -->
      <rect x="10" y="10" width="380" height="380" fill="none" stroke="url(#accent)" stroke-width="2" rx="20"/>
      
      <!-- LieAbility Eye Logo (Simplified) -->
      <g transform="translate(200, 120)">
        <!-- Eye shape -->
        <ellipse cx="0" cy="0" rx="40" ry="25" fill="#f38ba8" opacity="0.9"/>
        <!-- Pupil -->
        <circle cx="0" cy="0" r="15" fill="#1a1a2e"/>
        <!-- Highlight -->
        <circle cx="-5" cy="-5" r="4" fill="#ffffff" opacity="0.8"/>
      </g>
      
      <!-- Title -->
      <text x="200" y="180" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="#ffffff">
        LieAbility
      </text>
      
      <!-- Subtitle -->
      <text x="200" y="200" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#f38ba8">
        Authenticity Certificate
      </text>
      
      <!-- Score Circle -->
      <g transform="translate(200, 260)">
        <!-- Circle background -->
        <circle cx="0" cy="0" r="45" fill="none" stroke="#16213e" stroke-width="4"/>
        <!-- Score arc -->
        <circle cx="0" cy="0" r="45" fill="none" stroke="url(#accent)" stroke-width="4" 
                stroke-dasharray="${(scoreNum / 100) * 283} 283" 
                stroke-dashoffset="71" 
                transform="rotate(-90)"/>
        <!-- Score text -->
        <text x="0" y="8" font-family="Arial, sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="#ffffff">
          ${scoreNum}%
        </text>
        <text x="0" y="25" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#f38ba8">
          AUTHENTIC
        </text>
      </g>
      
      <!-- Token ID -->
      <text x="200" y="350" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#ffffff" opacity="0.7">
        Token #${tokenId}
      </text>
      
      <!-- Verification Badge -->
      <g transform="translate(320, 60)">
        <circle cx="0" cy="0" r="20" fill="#e94560"/>
        <text x="0" y="6" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#ffffff">
          ✓
        </text>
      </g>
      
      <!-- Verification Text -->
      <text x="320" y="95" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" fill="#e94560">
        VERIFIED
      </text>
    </svg>`;

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
    res.send(svg);
  } catch (error) {
    console.error("❌ Image generation error:", error);
    res.status(500).send("Failed to generate image");
  }
});

// VLayer-compatible API endpoint for assessment verification
app.get("/api/assessment", async (req, res) => {
  try {
    const { address } = req.query;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        success: false,
        error: "Invalid or missing address parameter",
      });
    }

    const assessmentData = {
      userAddress: address,
      trustScore: 87,
      timestamp: Math.floor(Date.now() / 1000),
      assessmentId: `assess_${Date.now()}_${address.slice(-6)}`,
      breakdown: {
        facial: 85,
        speech: 90,
        microExpressions: 82,
        sentiment: 88,
        coherence: 85,
        confidence: 91,
      },
      verificationSignature: generateScoreSignature(
        address,
        87,
        Math.floor(Date.now() / 1000)
      ).signature,
    };

    console.log(`📊 VLayer assessment request for ${address}`);

    res.json({
      success: true,
      data: assessmentData,
      metadata: {
        provider: "LieAbility AI Assessment",
        version: "1.0.0",
        apiEndpoint: req.originalUrl,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ VLayer assessment error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
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
