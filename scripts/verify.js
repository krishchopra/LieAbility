const {
  autoVerifyContract,
  isContractVerified,
  getContractUrl,
} = require("../src/utils/blockscout");
const fs = require("fs");
const path = require("path");

// Contract source code for verification (this would be your full flattened contract)
const CONTRACT_SOURCE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title LieAbilityNFT
 * @dev NFT contract for LieAbility authenticity assessment platform
 * Users can mint NFTs as proof of authenticity after passing assessment
 */
contract LieAbilityNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Mapping to track user eligibility and scores
    mapping(address => bool) public eligibleUsers;
    mapping(address => uint256) public userScores;
    mapping(address => bool) public hasMinted;
    
    // Minimum score required for minting
    uint256 public constant MINIMUM_SCORE = 75;
    
    // Events
    event EligibilityGranted(address indexed user, uint256 score);
    event EligibilityRevoked(address indexed user);
    event NFTMinted(address indexed user, uint256 tokenId, uint256 score);
    
    constructor() ERC721("LieAbility Authenticity Token", "LAT") {}
    
    /**
     * @dev Grant eligibility to users who passed the assessment
     * @param users Array of user addresses
     * @param scores Array of corresponding scores
     */
    function grantEligibility(address[] memory users, uint256[] memory scores) external onlyOwner {
        require(users.length == scores.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < users.length; i++) {
            require(scores[i] >= MINIMUM_SCORE, "Score below minimum threshold");
            
            eligibleUsers[users[i]] = true;
            userScores[users[i]] = scores[i];
            
            emit EligibilityGranted(users[i], scores[i]);
        }
    }
    
    /**
     * @dev Revoke eligibility for a user
     * @param user User address to revoke
     */
    function revokeEligibility(address user) external onlyOwner {
        eligibleUsers[user] = false;
        userScores[user] = 0;
        
        emit EligibilityRevoked(user);
    }
    
    /**
     * @dev Mint NFT for eligible users
     * Can only mint once per address
     */
    function mintNFT() external {
        require(eligibleUsers[msg.sender], "Not eligible to mint");
        require(!hasMinted[msg.sender], "Already minted");
        require(userScores[msg.sender] >= MINIMUM_SCORE, "Score too low");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(msg.sender, tokenId);
        hasMinted[msg.sender] = true;
        
        emit NFTMinted(msg.sender, tokenId, userScores[msg.sender]);
    }
    
    /**
     * @dev Check if user is eligible to mint
     * @param user User address to check
     * @return eligible Whether user can mint
     * @return score User's score
     * @return alreadyMinted Whether user already minted
     */
    function checkEligibility(address user) external view returns (bool eligible, uint256 score, bool alreadyMinted) {
        return (eligibleUsers[user], userScores[user], hasMinted[user]);
    }
    
    /**
     * @dev Get total number of minted tokens
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev Override tokenURI to provide metadata
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        
        // In production, this would return actual metadata URI
        return string(abi.encodePacked(
            "https://api.lieability.com/nft/metadata/",
            Strings.toString(tokenId)
        ));
    }
}
`;

async function main() {
  console.log("🔍 LieAbility NFT Contract Verification Tool");
  console.log("============================================");

  // Check if deployment info exists
  const deploymentPath = path.join(__dirname, "../deployment.json");

  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ deployment.json not found. Deploy the contract first.");
    console.log("Run: npm run deploy");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

  if (!deploymentInfo.evmAddress) {
    console.error("❌ No contract address found in deployment.json");
    process.exit(1);
  }

  const contractAddress = deploymentInfo.evmAddress;
  console.log(`📋 Contract Address: ${contractAddress}`);
  console.log(`🌐 Network: ${deploymentInfo.network || "testnet"}`);

  // Check if already verified
  console.log("\n🔍 Checking current verification status...");
  const alreadyVerified = await isContractVerified(contractAddress);

  if (alreadyVerified) {
    console.log("✅ Contract is already verified!");
    console.log(
      `🔗 View verified contract: ${getContractUrl(
        contractAddress,
        "contract"
      )}`
    );
    return;
  }

  console.log("⏳ Contract not yet verified. Starting verification process...");

  // Perform verification
  try {
    await autoVerifyContract(contractAddress, CONTRACT_SOURCE, "LieAbilityNFT");

    // Update deployment info
    deploymentInfo.verified = true;
    deploymentInfo.verifiedAt = new Date().toISOString();

    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

    console.log("\n✅ Verification process completed!");
    console.log("📄 Deployment info updated");
  } catch (error) {
    console.error("\n❌ Verification failed:", error.message);

    console.log("\n🔧 Manual Verification Steps:");
    console.log("1. Go to the contract page:");
    console.log(`   ${getContractUrl(contractAddress, "contract")}`);
    console.log("2. Click 'Verify & Publish' or similar button");
    console.log("3. Select 'Solidity (Single file)'");
    console.log("4. Enter compiler version: v0.8.9+commit.e5eed63a");
    console.log("5. Enable optimization: Yes (200 runs)");
    console.log("6. Paste the flattened contract source code");
    console.log("7. Submit for verification");

    console.log("\n💡 Troubleshooting Tips:");
    console.log("- Ensure exact compiler version match");
    console.log("- Check optimization settings");
    console.log("- Verify all imports are flattened correctly");
    console.log("- Match constructor arguments if any");
  }

  // Show useful links
  console.log("\n🔗 Useful Links:");
  console.log(
    `📊 Contract Overview: ${getContractUrl(contractAddress, "overview")}`
  );
  console.log(`📝 Source Code: ${getContractUrl(contractAddress, "contract")}`);
  console.log(
    `📖 Read Contract: ${getContractUrl(contractAddress, "read-contract")}`
  );
  console.log(
    `✍️ Write Contract: ${getContractUrl(contractAddress, "write-contract")}`
  );
}

// Command line options
const command = process.argv[2];

switch (command) {
  case "check":
    // Just check verification status
    checkVerificationStatus();
    break;
  case "links":
    // Show contract links
    showContractLinks();
    break;
  default:
    // Run full verification
    main();
}

async function checkVerificationStatus() {
  const deploymentPath = path.join(__dirname, "../deployment.json");

  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ deployment.json not found. Deploy the contract first.");
    return;
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const contractAddress = deploymentInfo.evmAddress;

  console.log("🔍 Checking verification status...");
  console.log(`📋 Contract: ${contractAddress}`);

  const verified = await isContractVerified(contractAddress);

  if (verified) {
    console.log("✅ Contract is verified!");
  } else {
    console.log("❌ Contract is not yet verified");
    console.log("Run: npm run verify");
  }
}

function showContractLinks() {
  const deploymentPath = path.join(__dirname, "../deployment.json");

  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ deployment.json not found. Deploy the contract first.");
    return;
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const contractAddress = deploymentInfo.evmAddress;

  console.log("🔗 Contract Links:");
  console.log(`📊 Overview: ${getContractUrl(contractAddress, "overview")}`);
  console.log(`📝 Source: ${getContractUrl(contractAddress, "contract")}`);
  console.log(`📖 Read: ${getContractUrl(contractAddress, "read-contract")}`);
  console.log(`✍️ Write: ${getContractUrl(contractAddress, "write-contract")}`);
}

module.exports = { main, checkVerificationStatus, showContractLinks };
