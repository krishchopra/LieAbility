// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@vlayer/solidity/Proof.sol";

/**
 * @title LieAbilityVerifier
 * @dev Verifies authenticity assessment scores using VLayer Web Proofs
 */
contract LieAbilityVerifier {
    struct AssessmentProof {
        uint256 trustScore;
        uint256 timestamp;
        string assessmentId;
        bool verified;
        bytes32 proofHash;
    }
    
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
    
    // Mapping from user address to their verified assessment
    mapping(address => AssessmentProof) public verifiedAssessments;
    
    // Mapping to track all verified proof hashes
    mapping(bytes32 => bool) public verifiedProofs;
    
    // Address of the AssessmentProver contract
    address public immutable assessmentProver;
    
    // Minimum trust score required for verification
    uint256 public constant MIN_TRUST_SCORE = 75;
    
    // Events
    event AssessmentVerified(
        address indexed user,
        uint256 trustScore,
        string assessmentId,
        uint256 timestamp,
        bytes32 proofHash
    );
    
    event ProofChallenged(
        address indexed challenger,
        address indexed user,
        bytes32 proofHash,
        string reason
    );
    
    constructor(address _assessmentProver) {
        assessmentProver = _assessmentProver;
    }
    
    /**
     * @dev Verify an assessment using VLayer proof
     * @param proof The VLayer proof containing the assessment data
     */
    function verifyAssessment(
        Proof calldata proof
    ) external {
        // Verify the proof comes from our trusted AssessmentProver
        AssessmentData memory assessmentData = proof.verifyWith(assessmentProver);
        
        // Ensure the assessment meets minimum requirements
        require(
            assessmentData.trustScore >= MIN_TRUST_SCORE, 
            "Trust score below minimum threshold"
        );
        
        // Ensure the assessment is recent (within 24 hours)
        require(
            block.timestamp - assessmentData.timestamp <= 86400,
            "Assessment data is too old"
        );
        
        // Generate proof hash for tracking
        bytes32 proofHash = keccak256(abi.encode(
            assessmentData.userAddress,
            assessmentData.trustScore,
            assessmentData.timestamp,
            assessmentData.assessmentId
        ));
        
        // Ensure this proof hasn't been used before
        require(!verifiedProofs[proofHash], "Proof already used");
        
        // Store the verified assessment
        verifiedAssessments[assessmentData.userAddress] = AssessmentProof({
            trustScore: assessmentData.trustScore,
            timestamp: assessmentData.timestamp,
            assessmentId: assessmentData.assessmentId,
            verified: true,
            proofHash: proofHash
        });
        
        // Mark proof as used
        verifiedProofs[proofHash] = true;
        
        emit AssessmentVerified(
            assessmentData.userAddress,
            assessmentData.trustScore,
            assessmentData.assessmentId,
            assessmentData.timestamp,
            proofHash
        );
    }
    
    /**
     * @dev Get verification status for a user
     * @param user The user address to check
     * @return The assessment proof data
     */
    function getVerificationStatus(address user) 
        external 
        view 
        returns (AssessmentProof memory) 
    {
        return verifiedAssessments[user];
    }
    
    /**
     * @dev Check if a user has a valid verification
     * @param user The user address to check
     * @return isVerified True if the user has a valid, recent verification
     */
    function isUserVerified(address user) external view returns (bool isVerified) {
        AssessmentProof memory assessment = verifiedAssessments[user];
        
        return assessment.verified && 
               assessment.trustScore >= MIN_TRUST_SCORE &&
               (block.timestamp - assessment.timestamp) <= 86400; // Valid for 24 hours
    }
    
    /**
     * @dev Challenge a verification if suspicious
     * @param user The user whose verification is being challenged
     * @param reason The reason for the challenge
     */
    function challengeVerification(address user, string calldata reason) external {
        AssessmentProof memory assessment = verifiedAssessments[user];
        require(assessment.verified, "No verification to challenge");
        
        // In a real implementation, this would start a dispute resolution process
        emit ProofChallenged(msg.sender, user, assessment.proofHash, reason);
    }
    
    /**
     * @dev Get the total number of verified users
     * @return count The number of users with valid verifications
     */
    function getVerifiedUserCount() external view returns (uint256 count) {
        // Note: This is a simplified implementation
        // In production, you'd want to track this more efficiently
        return 0; // Placeholder - implement counting logic
    }
    
    /**
     * @dev Emergency function to revoke a verification (admin only)
     * @param user The user whose verification should be revoked
     */
    function revokeVerification(address user) external {
        // In a real implementation, add proper access control
        require(msg.sender == address(this), "Unauthorized"); // Placeholder
        
        delete verifiedAssessments[user];
    }
} 