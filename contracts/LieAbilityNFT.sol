// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract LieAbilityNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MINT_PRICE = 0.01 ether; // 0.01 HBAR equivalent
    uint256 public constant MIN_TRUST_SCORE = 75; // Minimum score to qualify for minting
    
    // Mapping to track eligible addresses (those who passed the interview)
    mapping(address => bool) public isEligible;
    
    // Mapping to track trust scores for transparency
    mapping(address => uint256) public trustScores;
    
    // Mapping to prevent multiple mints per address
    mapping(address => bool) public hasMinted;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    // Events
    event EligibilityGranted(address indexed user, uint256 trustScore);
    event LieAbilityNFTMinted(address indexed to, uint256 indexed tokenId, uint256 trustScore);
    
    constructor() ERC721("LieAbility Authenticity Certificate", "LIEABILITY") {}
    
    /**
     * @dev Owner function to grant eligibility based on interview results
     * @param users Array of addresses that passed the interview
     * @param scores Array of corresponding trust scores
     */
    function grantEligibility(
        address[] calldata users, 
        uint256[] calldata scores
    ) external onlyOwner {
        require(users.length == scores.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < users.length; i++) {
            require(scores[i] >= MIN_TRUST_SCORE, "Score below minimum threshold");
            
            isEligible[users[i]] = true;
            trustScores[users[i]] = scores[i];
            
            emit EligibilityGranted(users[i], scores[i]);
        }
    }
    
    /**
     * @dev Revoke eligibility (if needed for moderation)
     */
    function revokeEligibility(address user) external onlyOwner {
        isEligible[user] = false;
        trustScores[user] = 0;
    }
    
    /**
     * @dev Mint function - only eligible users can mint
     */
    function mint() external payable {
        require(isEligible[msg.sender], "Not eligible to mint - complete authenticity assessment first");
        require(!hasMinted[msg.sender], "Already minted your LieAbility NFT");
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        require(_tokenIdCounter.current() < MAX_SUPPLY, "Max supply reached");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        hasMinted[msg.sender] = true;
        _safeMint(msg.sender, tokenId);
        
        emit LieAbilityNFTMinted(msg.sender, tokenId, trustScores[msg.sender]);
    }
    
    /**
     * @dev Owner mint function for airdrops/special cases
     */
    function ownerMint(address to) external onlyOwner {
        require(_tokenIdCounter.current() < MAX_SUPPLY, "Max supply reached");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
    }
    
    /**
     * @dev Set base URI for metadata
     */
    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Returns the base URI for tokens
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Get total supply of minted tokens
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev Check if an address is eligible and their trust score
     */
    function getEligibilityInfo(address user) external view returns (bool eligible, uint256 score, bool minted) {
        return (isEligible[user], trustScores[user], hasMinted[user]);
    }
    
    /**
     * @dev Withdraw contract balance
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Override tokenURI to include trust score in metadata
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 
            ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json"))
            : "";
    }
} 