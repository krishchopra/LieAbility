import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";

// Contract ABI for the LieAbilityNFTSimple contract
const CONTRACT_ABI = [
  "function mint() external",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function getEligibilityInfo(address user) external view returns (bool eligible, uint256 score)",
  "function isEligible(address user) external view returns (bool)",
  "function grantEligibility(address[] users, uint256[] scores) external",
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
];

// Backend API URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

// Contract address from environment
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

interface EligibilityInfo {
  eligible: boolean;
  score: number;
}

// Type for the contract with our specific functions
type LieAbilityContract = ethers.Contract & {
  mint(): Promise<ethers.ContractTransactionResponse>;
  getEligibilityInfo(user: string): Promise<[boolean, bigint]>;
  isEligible(user: string): Promise<boolean>;
};

export function useNFTContract() {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<LieAbilityContract | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [eligibilityInfo, setEligibilityInfo] =
    useState<EligibilityInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize contract when account changes
  useEffect(() => {
    if (account && provider && CONTRACT_ADDRESS) {
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      ) as LieAbilityContract;
      setContract(contractInstance);

      // Check eligibility when contract is set
      checkEligibility(account, contractInstance);
    }
  }, [account, provider]);

  // Check if user is eligible to mint
  const checkEligibility = async (
    address: string,
    contractInstance?: LieAbilityContract
  ) => {
    try {
      const contractToUse = contractInstance || contract;
      if (!contractToUse) {
        console.log("❌ No contract instance available");
        return;
      }

      console.log("🔍 Checking eligibility for:", address);
      console.log("📋 Contract address:", CONTRACT_ADDRESS);

      // Wrap in try-catch to handle ENS resolution errors on Hedera
      const [eligible, score] = await contractToUse.getEligibilityInfo(address);

      console.log("✅ Eligibility check result:", {
        eligible,
        score: Number(score),
      });

      setEligibilityInfo({
        eligible: eligible,
        score: Number(score),
      });
    } catch (error: any) {
      console.error("❌ Error checking eligibility:", error);

      // Don't show ENS errors to user - they're harmless
      if (!error.message?.includes("ENS")) {
        setError(`Failed to check eligibility: ${error.message}`);
      }
      setEligibilityInfo(null);
    }
  };

  // Connect wallet
  const connectWallet = async (): Promise<boolean> => {
    setError(null);
    setLoading(true);

    try {
      if (!window.ethereum) {
        setError("MetaMask not found. Please install MetaMask.");
        return false;
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        setError("No accounts found. Please connect your wallet.");
        return false;
      }

      // Create provider and get signer
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const network = await browserProvider.getNetwork();

      console.log("Connected to network:", network.name, network.chainId);

      setProvider(browserProvider);
      setAccount(accounts[0]);
      setConnected(true);

      toast.success("Wallet connected successfully!");
      return true;
    } catch (error: any) {
      console.error("Wallet connection error:", error);
      setError(error.message || "Failed to connect wallet");
      toast.error("Failed to connect wallet");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Submit assessment to backend
  const submitAssessment = async (trustScore: number): Promise<boolean> => {
    if (!account) {
      setError("Please connect your wallet first");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Submitting assessment to backend...", {
        account,
        trustScore,
      });

      const response = await fetch(`${BACKEND_URL}/api/submit-assessment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAddress: account,
          trustScore: trustScore,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit assessment");
      }

      if (data.success) {
        console.log("Assessment submitted successfully:", data);
        toast.success(
          "Assessment verified! You are now eligible to mint an NFT."
        );

        // Refresh eligibility status
        setTimeout(() => checkEligibility(account), 3000);
        return true;
      } else {
        throw new Error(data.error || "Assessment submission failed");
      }
    } catch (error: any) {
      console.error("Assessment submission error:", error);
      setError(error.message || "Failed to submit assessment");
      toast.error(`Assessment submission failed: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Mint NFT
  const mintNFT = async (): Promise<boolean> => {
    if (!connected || !account || !contract || !provider) {
      setError("Please connect your wallet first");
      return false;
    }

    if (!eligibilityInfo?.eligible) {
      setError(
        "You are not eligible to mint. Please complete the assessment first."
      );
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Minting NFT...");

      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer) as LieAbilityContract;

      // Call mint function
      const tx = await contractWithSigner.mint();
      console.log("Transaction sent:", tx.hash);

      toast.info("Transaction sent! Waiting for confirmation...");

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      // Refresh eligibility status
      setTimeout(() => checkEligibility(account), 3000);

      return true;
    } catch (error: any) {
      console.error("Minting error:", error);

      // Parse error message
      let errorMessage = "Minting failed";
      if (error.message) {
        if (error.message.includes("Already minted")) {
          errorMessage = "You have already minted your NFT";
        } else if (error.message.includes("Not eligible")) {
          errorMessage = "You are not eligible to mint";
        } else if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds for transaction";
        } else if (error.message.includes("user rejected")) {
          errorMessage = "Transaction was rejected";
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setConnected(false);
    setAccount(null);
    setContract(null);
    setProvider(null);
    setEligibilityInfo(null);
    setError(null);
  };

  return {
    connected,
    account,
    contract,
    eligibilityInfo,
    loading,
    error,
    contractAddress: CONTRACT_ADDRESS,
    connectWallet,
    submitAssessment,
    mintNFT,
    disconnectWallet,
    checkEligibility: () => account && checkEligibility(account),
  };
}

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (args: any) => void) => void;
      removeListener: (event: string, callback: (args: any) => void) => void;
    };
  }
}
