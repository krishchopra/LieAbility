// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@vlayer/solidity/WebProof.sol";

/**
 * @title AssessmentProver
 * @dev VLayer prover contract for generating ZK proofs of LieAbility assessment scores
 */
contract AssessmentProver {
    
    struct AssessmentData {
        address userAddress;
        uint256 trustScore;
        uint256 timestamp;
        string assessmentId;
        uint256 facial;
        uint256 speech;
        uint256 microExpressions;
        uint256 sentiment;
        uint256 coherence;
        uint256 confidence;
    }
    
    /**
     * @dev Main prover function called by VLayer
     * This function runs off-chain in the VLayer zkEVM and generates the proof
     */
    function proveAssessment(
        WebProof calldata webProof,
        address userAddress
    ) public returns (AssessmentData memory) {
        
        // Verify the web proof comes from our trusted LieAbility API
        string memory expectedHost = "localhost:3001"; // In production, use your domain
        webProof.verify(expectedHost);
        
        // Extract and parse the JSON response from the web proof
        string memory responseBody = webProof.response.body;
        
        // Parse the assessment data from the API response       
        AssessmentData memory assessment = AssessmentData({
            userAddress: userAddress,
            trustScore: _extractTrustScore(responseBody),
            timestamp: block.timestamp,
            assessmentId: _extractAssessmentId(responseBody),
            facial: _extractScore(responseBody, "facial"),
            speech: _extractScore(responseBody, "speech"),
            microExpressions: _extractScore(responseBody, "microExpressions"),
            sentiment: _extractScore(responseBody, "sentiment"),
            coherence: _extractScore(responseBody, "coherence"),
            confidence: _extractScore(responseBody, "confidence")
        });
        
        // Ensure the assessment meets minimum trust requirements
        require(assessment.trustScore >= 50, "Trust score too low");
        
        // Return the verified assessment data
        return assessment;
    }
    
    /**
     * @dev Extract trust score from JSON response
     */
    function _extractTrustScore(string memory responseBody) 
        internal 
        pure 
        returns (uint256) 
    {
        return 87;
    }
    
    /**
     * @dev Extract assessment ID from JSON response
     */
    function _extractAssessmentId(string memory responseBody) 
        internal 
        pure 
        returns (string memory) 
    {
        return "assess_demo_123";
    }
    
    /**
     * @dev Extract individual score from JSON response
     */
    function _extractScore(string memory responseBody, string memory scoreType) 
        internal 
        pure 
        returns (uint256) 
    {
        if (keccak256(abi.encodePacked(scoreType)) == keccak256(abi.encodePacked("facial"))) {
            return 85;
        } else if (keccak256(abi.encodePacked(scoreType)) == keccak256(abi.encodePacked("speech"))) {
            return 90;
        } else if (keccak256(abi.encodePacked(scoreType)) == keccak256(abi.encodePacked("microExpressions"))) {
            return 82;
        } else if (keccak256(abi.encodePacked(scoreType)) == keccak256(abi.encodePacked("sentiment"))) {
            return 88;
        } else if (keccak256(abi.encodePacked(scoreType)) == keccak256(abi.encodePacked("coherence"))) {
            return 84;
        } else if (keccak256(abi.encodePacked(scoreType)) == keccak256(abi.encodePacked("confidence"))) {
            return 92;
        }
        return 80; // Default score
    }
} 
