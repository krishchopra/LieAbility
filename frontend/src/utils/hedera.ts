import {
  Client,
  FileCreateTransaction,
  ContractCreateTransaction,
  ContractExecuteTransaction,
  ContractCallQuery,
  ContractFunctionParameters,
  PrivateKey,
  AccountId,
  Hbar,
  ContractId,
} from "@hashgraph/sdk";
import { ethers } from "ethers";

// Network configuration
export const HEDERA_CONFIG = {
  testnet: {
    networkId: "testnet",
    operatorId: process.env.VITE_HEDERA_OPERATOR_ID || "",
    operatorKey: process.env.VITE_HEDERA_OPERATOR_KEY || "",
    jsonRpcUrl: "https://testnet.hashio.io/api",
    mirrorNodeUrl: "https://testnet.mirrornode.hedera.com",
    explorerUrl: "https://hashscan.io/testnet",
  },
  mainnet: {
    networkId: "mainnet",
    operatorId: process.env.VITE_HEDERA_OPERATOR_ID || "",
    operatorKey: process.env.VITE_HEDERA_OPERATOR_KEY || "",
    jsonRpcUrl: "https://mainnet.hashio.io/api",
    mirrorNodeUrl: "https://mainnet.mirrornode.hedera.com",
    explorerUrl: "https://hashscan.io/mainnet",
  },
};

// Use testnet by default for development
export const getCurrentConfig = () => HEDERA_CONFIG.testnet;

// Initialize Hedera client
export const createHederaClient = () => {
  const config = getCurrentConfig();

  if (!config.operatorId || !config.operatorKey) {
    throw new Error("Hedera operator credentials not configured");
  }

  const client = Client.forTestnet();
  client.setOperator(
    AccountId.fromString(config.operatorId),
    PrivateKey.fromString(config.operatorKey)
  );

  return client;
};

// Contract deployment function
export const deployContract = async (
  bytecode: string,
  constructorParams?: any[]
) => {
  const client = createHederaClient();

  try {
    // Step 1: Upload bytecode to File Service
    const fileCreateTx = new FileCreateTransaction()
      .setContents(bytecode)
      .setMaxTransactionFee(new Hbar(2));

    const fileCreateSubmit = await fileCreateTx.execute(client);
    const fileCreateRx = await fileCreateSubmit.getReceipt(client);
    const bytecodeFileId = fileCreateRx.fileId!;

    console.log("Bytecode uploaded to file:", bytecodeFileId.toString());

    // Step 2: Create the contract
    let contractCreateTx = new ContractCreateTransaction()
      .setBytecodeFileId(bytecodeFileId)
      .setGas(1000000)
      .setMaxTransactionFee(new Hbar(20));

    // Add constructor parameters if provided
    if (constructorParams && constructorParams.length > 0) {
      const contractFunctionParams = new ContractFunctionParameters();
      constructorParams.forEach((param) => {
        if (typeof param === "string") {
          contractFunctionParams.addString(param);
        } else if (typeof param === "number") {
          contractFunctionParams.addUint256(param);
        }
        // Add more types as needed
      });
      contractCreateTx = contractCreateTx.setConstructorParameters(
        contractFunctionParams
      );
    }

    const contractCreateSubmit = await contractCreateTx.execute(client);
    const contractCreateRx = await contractCreateSubmit.getReceipt(client);
    const contractId = contractCreateRx.contractId!;

    console.log("Contract deployed with ID:", contractId.toString());

    return {
      contractId: contractId.toString(),
      evmAddress: contractId.toSolidityAddress(),
      fileId: bytecodeFileId.toString(),
    };
  } catch (error) {
    console.error("Error deploying contract:", error);
    throw error;
  } finally {
    client.close();
  }
};

// Grant eligibility to users (owner function)
export const grantEligibility = async (
  contractId: string,
  userAddresses: string[],
  trustScores: number[]
) => {
  const client = createHederaClient();

  try {
    const contractExecuteTx = new ContractExecuteTransaction()
      .setContractId(ContractId.fromString(contractId))
      .setGas(500000)
      .setFunction(
        "grantEligibility",
        new ContractFunctionParameters()
          .addAddressArray(userAddresses.map((addr) => addr.toLowerCase()))
          .addUint256Array(trustScores)
      )
      .setMaxTransactionFee(new Hbar(10));

    const contractExecuteSubmit = await contractExecuteTx.execute(client);
    const contractExecuteRx = await contractExecuteSubmit.getReceipt(client);

    console.log("Eligibility granted successfully");
    return contractExecuteRx.transactionId.toString();
  } catch (error) {
    console.error("Error granting eligibility:", error);
    throw error;
  } finally {
    client.close();
  }
};

// Check eligibility status
export const checkEligibility = async (
  contractId: string,
  userAddress: string
) => {
  const client = createHederaClient();

  try {
    const contractCallQuery = new ContractCallQuery()
      .setContractId(ContractId.fromString(contractId))
      .setGas(100000)
      .setFunction(
        "getEligibilityInfo",
        new ContractFunctionParameters().addAddress(userAddress.toLowerCase())
      );

    const contractCallResult = await contractCallQuery.execute(client);

    const eligible = contractCallResult.getBool(0);
    const score = contractCallResult.getUint256(1);
    const hasMinted = contractCallResult.getBool(2);

    return {
      eligible,
      score: score.toNumber(),
      hasMinted,
    };
  } catch (error) {
    console.error("Error checking eligibility:", error);
    throw error;
  } finally {
    client.close();
  }
};

// Mint NFT function
export const mintNFT = async (
  contractId: string,
  paymentAmount: string = "0.01"
) => {
  const client = createHederaClient();

  try {
    const contractExecuteTx = new ContractExecuteTransaction()
      .setContractId(ContractId.fromString(contractId))
      .setGas(300000)
      .setFunction("mint")
      .setPayableAmount(new Hbar(parseFloat(paymentAmount)))
      .setMaxTransactionFee(new Hbar(5));

    const contractExecuteSubmit = await contractExecuteTx.execute(client);
    const contractExecuteRx = await contractExecuteSubmit.getReceipt(client);

    console.log("NFT minted successfully");
    return contractExecuteRx.transactionId.toString();
  } catch (error) {
    console.error("Error minting NFT:", error);
    throw error;
  } finally {
    client.close();
  }
};

// Web3 provider for MetaMask integration
export const getWeb3Provider = () => {
  const config = getCurrentConfig();

  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }

  // Fallback to JSON-RPC provider
  return new ethers.JsonRpcProvider(config.jsonRpcUrl);
};

// Convert Hedera account ID to EVM address
export const hederaIdToEvmAddress = (hederaId: string): string => {
  return ContractId.fromString(hederaId).toSolidityAddress();
};

// Get contract instance for Web3 interactions
export const getContractInstance = async (
  contractAddress: string,
  abi: any[]
) => {
  const provider = getWeb3Provider();

  // If MetaMask is available, use it as signer
  if (typeof window !== "undefined" && window.ethereum) {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, abi, signer);
  }

  // Otherwise, return read-only contract
  return new ethers.Contract(contractAddress, abi, provider);
};

// Helper to format HBAR amounts
export const formatHbar = (amount: number): string => {
  return `${amount} HBAR`;
};

// Helper to parse HBAR to wei (for ethers.js compatibility)
export const hbarToWei = (hbarAmount: string): bigint => {
  return ethers.parseEther(hbarAmount);
};
