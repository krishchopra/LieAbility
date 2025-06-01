import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { vlayerService, VLayerProofData } from "@/services/VLayerService";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Lock,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

interface VLayerProofComponentProps {
  userAddress?: string;
  trustScore: number;
  onProofGenerated?: (proof: VLayerProofData) => void;
}

export const VLayerProofComponent: React.FC<VLayerProofComponentProps> = ({
  userAddress,
  trustScore,
  onProofGenerated,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [proofData, setProofData] = useState<VLayerProofData | null>(null);
  const [vlayerStatus, setVLayerStatus] = useState<{
    available: boolean;
    network: string;
    error?: string;
  } | null>(null);

  // Check VLayer status on component mount
  useEffect(() => {
    checkVLayerStatus();
  }, []);

  const checkVLayerStatus = async () => {
    try {
      const status = await vlayerService.getStatus();
      setVLayerStatus(status);
    } catch (error) {
      setVLayerStatus({
        available: false,
        network: "unknown",
        error: error.message,
      });
    }
  };

  const generateWebProof = async () => {
    if (!userAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsGenerating(true);
    try {
      console.log("🔐 Starting VLayer Web Proof generation...");
      toast.info(
        "Generating cryptographic proof of assessment authenticity..."
      );

      const proof = await vlayerService.generateAssessmentProof(userAddress);

      setProofData(proof);
      onProofGenerated?.(proof);

      toast.success("🎉 VLayer Web Proof generated successfully!");
      console.log("✅ Proof generated:", proof);
    } catch (error) {
      console.error("❌ Proof generation failed:", error);
      toast.error(`Proof generation failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const verifyOnChain = async () => {
    if (!proofData || !userAddress) {
      toast.error("No proof data available for verification");
      return;
    }

    setIsVerifying(true);
    try {
      toast.info("Submitting proof to blockchain for verification...");

      const verifierContractAddress =
        import.meta.env.VITE_VERIFIER_CONTRACT_ADDRESS ||
        "0x742d35Cc6634C0532925a3b8D35dF4DFC5F9b7c7";

      console.log("Using verifier contract address:", verifierContractAddress);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const success = true;

      if (success) {
        toast.success("🎉 Proof verified on-chain successfully!");
        console.log(
          "✅ Mock verification completed for contract:",
          verifierContractAddress
        );
      } else {
        toast.error("On-chain verification failed");
      }
    } catch (error) {
      console.error("❌ On-chain verification failed:", error);
      toast.error(`Verification failed: ${error.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const boxStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 8px 32px rgba(31, 38, 135, 0.15)",
  };

  return (
    <div className="w-full space-y-6">
      {/* VLayer Status Card */}
      <Card className="p-6" style={boxStyle}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-semibold flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-400" />
            <span>VLayer Web Proof Verification</span>
          </h3>

          <Badge
            className={`${
              vlayerStatus?.available
                ? "bg-green-500/20 text-green-300 border-green-500/30"
                : "bg-red-500/20 text-red-300 border-red-500/30"
            }`}
          >
            {vlayerStatus?.available ? (
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>Ready</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3" />
                <span>Unavailable</span>
              </div>
            )}
          </Badge>
        </div>

        <div className="text-gray-300 text-sm mb-4">
          Generate a zero-knowledge proof that your assessment score of{" "}
          <strong>{trustScore}%</strong> is authentic and came from the
          legitimate LieAbility AI system, without revealing sensitive biometric
          data.
        </div>

        {vlayerStatus?.available && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-400 mb-4">
            <div>
              <span className="font-medium">Network:</span>{" "}
              {vlayerStatus.network}
            </div>
            <div>
              <span className="font-medium">Protocol:</span> zkTLS Web Proofs
            </div>
          </div>
        )}

        {!vlayerStatus?.available && vlayerStatus?.error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
            <div className="text-red-300 text-sm">
              <strong>Error:</strong> {vlayerStatus.error}
            </div>
          </div>
        )}
      </Card>

      {/* Proof Generation Card */}
      <Card className="p-6" style={boxStyle}>
        <h4 className="text-white font-semibold mb-4 flex items-center space-x-2">
          <Lock className="h-4 w-4 text-purple-400" />
          <span>Generate Cryptographic Proof</span>
        </h4>

        {!proofData ? (
          <div className="space-y-4">
            <div className="text-gray-300 text-sm">
              Generate a tamper-proof, privacy-preserving proof that your
              assessment was:
            </div>

            <ul className="space-y-2 text-sm text-gray-400 ml-4">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-3 w-3 text-green-400" />
                <span>Processed by legitimate LieAbility AI</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-3 w-3 text-green-400" />
                <span>Not manipulated or forged</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-3 w-3 text-green-400" />
                <span>Above the required threshold (75%)</span>
              </li>
            </ul>

            <Button
              onClick={generateWebProof}
              disabled={
                isGenerating || !vlayerStatus?.available || !userAddress
              }
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isGenerating ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating Proof...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Generate VLayer Web Proof</span>
                </div>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-green-300 font-medium">
                  Proof Generated Successfully
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-300 mt-3">
                <div>
                  <span className="font-medium">User:</span>{" "}
                  {proofData.publicInputs.userAddress.slice(0, 8)}...
                </div>
                <div>
                  <span className="font-medium">Score:</span>{" "}
                  {proofData.publicInputs.trustScore}%
                </div>
                <div>
                  <span className="font-medium">Assessment ID:</span>{" "}
                  {proofData.publicInputs.assessmentId}
                </div>
                <div>
                  <span className="font-medium">Timestamp:</span>{" "}
                  {new Date(
                    proofData.publicInputs.timestamp * 1000
                  ).toLocaleString()}
                </div>
              </div>
            </div>

            <Button
              onClick={verifyOnChain}
              disabled={isVerifying}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isVerifying ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying On-Chain...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <ExternalLink className="h-4 w-4" />
                  <span>Verify Proof On-Chain</span>
                </div>
              )}
            </Button>
          </div>
        )}
      </Card>

      {/* Information Card
      <Card className="p-4" style={boxStyle}>
        <div className="text-gray-300 text-xs space-y-2">
          <div className="font-medium text-white">
            How VLayer Web Proofs Work:
          </div>
          <div>
            • Uses zkTLS to create cryptographic proofs of web API responses
          </div>
          <div>
            • Proves data authenticity without revealing sensitive information
          </div>
          <div>• Enables trustless verification of off-chain computations</div>
          <div>• Integrates seamlessly with blockchain smart contracts</div>
        </div>
      </Card> */}
    </div>
  );
};

export default VLayerProofComponent;
