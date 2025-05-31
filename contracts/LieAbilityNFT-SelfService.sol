// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title LieAbilityNFT - Self Service Version
 * @dev NFT contract where users can claim eligibility themselves with proof
 * Eliminates need for backend to grant eligibility
 */
contract LieAbilityNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    using ECDSA for bytes32;
    
    Counters.Counter private _tokenIdCounter;
    
    // Mapping to track user eligibility and scores
    mapping(address => bool) public eligibleUsers;
    mapping(address => uint256) public userScores;
    mapping(address => bool) public hasMinted;
    mapping(bytes32 => bool) public usedProofs; // Prevent replay attacks
    
    // Minimum score required for minting
    uint256 public constant MINIMUM_SCORE = 75;
    
    // Assessment authority (could be contract owner or dedicated assessment key)
    address public assessmentAuthority;
    
    // Events
    event EligibilityClaimed(address indexed user, uint256 score);
    event EligibilityRevoked(address indexed user);
    event NFTMinted(address indexed user, uint256 tokenId, uint256 score);
    
    constructor() ERC721("LieAbility Authenticity Token", "LAT") {
        assessmentAuthority = msg.sender; // Owner can assess initially
    }
    
    /**
     * @dev Set who can sign assessment proofs
     * @param authority Address that can sign assessment results
     */
    function setAssessmentAuthority(address authority) external onlyOwner {
        assessmentAuthority = authority;
    }
    
    /**
     * @dev Users claim eligibility with cryptographic proof
     * @param score Their assessment score
     * @param nonce Unique identifier to prevent replay
     * @param signature Signed proof from assessment authority
     */
    function claimEligibility(
        uint256 score,
        uint256 nonce,
        bytes calldata signature
    ) external {
        require(score >= MINIMUM_SCORE, "Score below minimum threshold");
        require(!eligibleUsers[msg.sender], "Already eligible");
        
        // Create message hash
        bytes32 messageHash = keccak256(
            abi.encodePacked(msg.sender, score, nonce, address(this))
        );
        
        // Prevent replay attacks
        require(!usedProofs[messageHash], "Proof already used");
        
        // Verify signature from assessment authority
        address signer = messageHash.toEthSignedMessageHash().recover(signature);
        require(signer == assessmentAuthority, "Invalid signature");
        
        // Mark proof as used and grant eligibility
        usedProofs[messageHash] = true;
        eligibleUsers[msg.sender] = true;
        userScores[msg.sender] = score;
        
        emit EligibilityClaimed(msg.sender, score);
    }
    
    /**
     * @dev Mint NFT for eligible users - same as before
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
     * @dev Owner can still revoke eligibility if needed
     */
    function revokeEligibility(address user) external onlyOwner {
        eligibleUsers[user] = false;
        userScores[user] = 0;
        emit EligibilityRevoked(user);
    }
    
    /**
     * @dev Check eligibility status - same as before
     */
    function checkEligibility(address user) 
        external 
        view 
        returns (bool eligible, uint256 score, bool alreadyMinted) 
    {
        return (eligibleUsers[user], userScores[user], hasMinted[user]);
    }
    
    /**
     * @dev Get total supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev Token metadata
     */
    function tokenURI(uint256 tokenId) 
        public 
        view 
        virtual 
        override 
        returns (string memory) 
    {
        require(_exists(tokenId), "Token does not exist");
        
        return string(abi.encodePacked(
            "https://api.lieability.com/nft/metadata/",
            Strings.toString(tokenId)
        ));
    }
} 