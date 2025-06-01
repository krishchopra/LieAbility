import { getCurrentConfig } from "./hedera";

// BlockScout API endpoints for different networks
const BLOCKSCOUT_CONFIG = {
  testnet: {
    apiUrl: "https://hashscan.io/testnet/api",
    explorerUrl: "https://hashscan.io/testnet",
    // Hedera uses HashScan as their BlockScout instance
  },
  mainnet: {
    apiUrl: "https://hashscan.io/mainnet/api",
    explorerUrl: "https://hashscan.io/mainnet",
  },
};

interface VerificationRequest {
  contractAddress: string;
  sourceCode: string;
  contractName: string;
  compilerVersion: string;
  optimizationUsed: boolean;
  runs?: number;
  constructorArguments?: string;
}

interface VerificationResponse {
  success: boolean;
  message: string;
  guid?: string;
}

/**
 * Get BlockScout configuration for current network
 */
export const getBlockScoutConfig = () => {
  const hederaConfig = getCurrentConfig();
  return BLOCKSCOUT_CONFIG[
    hederaConfig.networkId as keyof typeof BLOCKSCOUT_CONFIG
  ];
};

/**
 * Verify smart contract on BlockScout/HashScan
 */
export const verifyContract = async (
  request: VerificationRequest
): Promise<VerificationResponse> => {
  const config = getBlockScoutConfig();

  try {
    console.log("🔍 Starting contract verification on BlockScout...");

    // Prepare verification payload - ensure all values are strings
    const payload: Record<string, string> = {
      module: "contract",
      action: "verifysourcecode",
      addressHash: request.contractAddress.toLowerCase(),
      name: request.contractName,
      compilerVersion: request.compilerVersion,
      optimization: request.optimizationUsed ? "1" : "0",
      contractSourceCode: request.sourceCode,
    };

    // Add optional parameters as strings
    if (request.runs) {
      payload.runs = request.runs.toString();
    }
    if (request.constructorArguments) {
      payload.constructorArguments = request.constructorArguments;
    }

    const response = await fetch(
      `${config.apiUrl}?module=contract&action=verifysourcecode`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(payload).toString(),
      }
    );

    const result = await response.json();

    if (result.status === "1") {
      console.log("✅ Verification submitted successfully");

      // Check verification status
      const verified = await checkVerificationStatus(
        request.contractAddress,
        result.result
      );

      return {
        success: verified,
        message: verified
          ? "Contract verified successfully"
          : "Verification submitted, check status manually",
        guid: result.result,
      };
    } else {
      return {
        success: false,
        message: result.result || "Verification failed",
      };
    }
  } catch (error) {
    console.error("Error verifying contract:", error);
    return {
      success: false,
      message: `Verification error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

/**
 * Check verification status
 */
export const checkVerificationStatus = async (
  contractAddress: string,
  guid?: string
): Promise<boolean> => {
  const config = getBlockScoutConfig();

  try {
    // For HashScan, we'll check if the contract source is visible
    const response = await fetch(
      `${config.apiUrl}?module=contract&action=getsourcecode&address=${contractAddress}`
    );
    const result = await response.json();

    if (result.status === "1" && result.result?.[0]?.SourceCode) {
      console.log("✅ Contract verification confirmed");
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking verification status:", error);
    return false;
  }
};

/**
 * Get contract source code from BlockScout (if verified)
 */
export const getVerifiedSource = async (contractAddress: string) => {
  const config = getBlockScoutConfig();

  try {
    const response = await fetch(
      `${config.apiUrl}?module=contract&action=getsourcecode&address=${contractAddress}`
    );
    const result = await response.json();

    if (result.status === "1" && result.result?.[0]) {
      return {
        sourceCode: result.result[0].SourceCode,
        contractName: result.result[0].ContractName,
        compilerVersion: result.result[0].CompilerVersion,
        optimizationUsed: result.result[0].OptimizationUsed === "1",
        abi: result.result[0].ABI,
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching verified source:", error);
    return null;
  }
};

/**
 * Generate BlockScout/HashScan URL for contract
 */
export const getContractUrl = (
  contractAddress: string,
  tab: "overview" | "contract" | "read-contract" | "write-contract" = "overview"
): string => {
  const config = getBlockScoutConfig();

  const tabMap = {
    overview: "",
    contract: "#code",
    "read-contract": "#read-contract",
    "write-contract": "#write-contract",
  };

  return `${config.explorerUrl}/address/${contractAddress}${tabMap[tab]}`;
};

/**
 * Generate flattened Solidity source for verification
 * This would typically be done by a Solidity flattener tool
 */
export const generateFlattenedSource = (
  mainContract: string,
  imports: string[] = []
): string => {
  // This is a simplified version - in practice, you'd use tools like:
  // - solidity-flattener
  // - truffle-flattener
  // - hardhat flatten

  const openZeppelinImports = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// OpenZeppelin Contracts (flattened for verification)
// Note: In practice, use proper flattening tools

// ERC721 implementation would go here...
// Ownable implementation would go here...
// Counters implementation would go here...
`;

  return openZeppelinImports + "\n\n" + mainContract;
};

/**
 * Auto-verify contract after deployment
 */
export const autoVerifyContract = async (
  contractAddress: string,
  sourceCode: string,
  contractName: string = "LieAbilityNFT"
): Promise<void> => {
  console.log("🔍 Starting automated contract verification...");

  const verificationRequest: VerificationRequest = {
    contractAddress,
    sourceCode,
    contractName,
    compilerVersion: "v0.8.9+commit.e5eed63a", // Match your Solidity version
    optimizationUsed: true,
    runs: 200,
  };

  const result = await verifyContract(verificationRequest);

  if (result.success) {
    console.log("✅ Contract verified successfully on BlockScout!");
    console.log(`🔗 View at: ${getContractUrl(contractAddress, "contract")}`);
  } else {
    console.log("⚠️ Verification submitted but may need manual completion");
    console.log(
      `🔗 Manual verification: ${getContractUrl(contractAddress, "contract")}`
    );
    console.log(`Error: ${result.message}`);
  }
};

/**
 * Check if contract is already verified
 */
export const isContractVerified = async (
  contractAddress: string
): Promise<boolean> => {
  const source = await getVerifiedSource(contractAddress);
  return source !== null;
};

export { type VerificationRequest, type VerificationResponse };
