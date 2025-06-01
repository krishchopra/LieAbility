// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface IERC721 {
    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function setApprovalForAll(address operator, bool approved) external;
    function getApproved(uint256 tokenId) external view returns (address operator);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

interface IERC721Metadata {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

contract LieAbilityNFTSimple is IERC165, IERC721, IERC721Metadata {
    // Token name
    string private _name;
    
    // Token symbol
    string private _symbol;
    
    // Owner of the contract
    address public owner;
    
    // Token ID counter
    uint256 private _tokenIdCounter;
    
    // Mapping from token ID to owner address
    mapping(uint256 => address) private _owners;
    
    // Mapping owner address to token count
    mapping(address => uint256) private _balances;
    
    // Mapping from token ID to approved address
    mapping(uint256 => address) private _tokenApprovals;
    
    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    
    // Mapping to track eligible addresses
    mapping(address => bool) public isEligible;
    
    // Mapping to track trust scores
    mapping(address => uint256) public trustScores;
    
    // Constants
    uint256 public constant MIN_TRUST_SCORE = 75;
    uint256 public constant MAX_SUPPLY = 10000;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event EligibilityGranted(address indexed user, uint256 trustScore);
    event LieAbilityNFTMinted(address indexed to, uint256 indexed tokenId, uint256 trustScore);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor() {
        _name = "LieAbility Authenticity Certificate";
        _symbol = "LIEABILITY";
        owner = msg.sender;
    }
    
    // ERC165 implementation
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }
    
    // ERC721Metadata implementation
    function name() public view virtual override returns (string memory) {
        return _name;
    }
    
    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }
    
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return string(abi.encodePacked("https://api.lieability.com/nft/metadata/", _toString(tokenId)));
    }
    
    // ERC721 implementation
    function balanceOf(address ownerAddr) public view virtual override returns (uint256) {
        require(ownerAddr != address(0), "ERC721: address zero is not a valid owner");
        return _balances[ownerAddr];
    }
    
    function ownerOf(uint256 tokenId) public view virtual override returns (address) {
        return _ownerOf(tokenId);
    }
    
    function approve(address to, uint256 tokenId) public virtual override {
        address ownerAddr = LieAbilityNFTSimple.ownerOf(tokenId);
        require(to != ownerAddr, "ERC721: approval to current owner");
        require(
            msg.sender == ownerAddr || isApprovedForAll(ownerAddr, msg.sender),
            "ERC721: approve caller is not token owner or approved for all"
        );
        _approve(to, tokenId);
    }
    
    function getApproved(uint256 tokenId) public view virtual override returns (address) {
        require(_exists(tokenId), "ERC721: invalid token ID");
        return _tokenApprovals[tokenId];
    }
    
    function setApprovalForAll(address operator, bool approved) public virtual override {
        _setApprovalForAll(msg.sender, operator, approved);
    }
    
    function isApprovedForAll(address ownerAddr, address operator) public view virtual override returns (bool) {
        return _operatorApprovals[ownerAddr][operator];
    }
    
    function transferFrom(address from, address to, uint256 tokenId) public virtual override {
        require(_isApprovedOrOwner(msg.sender, tokenId), "ERC721: caller is not token owner or approved");
        _transfer(from, to, tokenId);
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId) public virtual override {
        safeTransferFrom(from, to, tokenId, "");
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public virtual override {
        require(_isApprovedOrOwner(msg.sender, tokenId), "ERC721: caller is not token owner or approved");
        _safeTransfer(from, to, tokenId, data);
    }
    
    // Custom functions for LieAbility
    function grantEligibility(address[] calldata users, uint256[] calldata scores) external onlyOwner {
        require(users.length == scores.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < users.length; i++) {
            require(scores[i] >= MIN_TRUST_SCORE, "Score below minimum threshold");
            
            isEligible[users[i]] = true;
            trustScores[users[i]] = scores[i];
            
            emit EligibilityGranted(users[i], scores[i]);
        }
    }
    
    function revokeEligibility(address user) external onlyOwner {
        isEligible[user] = false;
        trustScores[user] = 0;
    }
    
    function mint() external {
        require(isEligible[msg.sender], "Not eligible to mint");
        require(_tokenIdCounter < MAX_SUPPLY, "Max supply reached");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(msg.sender, tokenId);
        
        emit LieAbilityNFTMinted(msg.sender, tokenId, trustScores[msg.sender]);
    }
    
    function getEligibilityInfo(address user) external view returns (bool eligible, uint256 score) {
        return (isEligible[user], trustScores[user]);
    }
    
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    // Internal functions
    function _ownerOf(uint256 tokenId) internal view returns (address) {
        return _owners[tokenId];
    }
    
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
    
    function _safeMint(address to, uint256 tokenId) internal {
        _mint(to, tokenId);
    }
    
    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "ERC721: mint to the zero address");
        require(!_exists(tokenId), "ERC721: token already minted");
        
        _balances[to] += 1;
        _owners[tokenId] = to;
        
        emit Transfer(address(0), to, tokenId);
    }
    
    function _transfer(address from, address to, uint256 tokenId) internal {
        require(LieAbilityNFTSimple.ownerOf(tokenId) == from, "ERC721: transfer from incorrect owner");
        require(to != address(0), "ERC721: transfer to the zero address");
        
        _approve(address(0), tokenId);
        
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;
        
        emit Transfer(from, to, tokenId);
    }
    
    function _approve(address to, uint256 tokenId) internal {
        _tokenApprovals[tokenId] = to;
        emit Approval(LieAbilityNFTSimple.ownerOf(tokenId), to, tokenId);
    }
    
    function _setApprovalForAll(address ownerAddr, address operator, bool approved) internal {
        require(ownerAddr != operator, "ERC721: approve to caller");
        _operatorApprovals[ownerAddr][operator] = approved;
        emit ApprovalForAll(ownerAddr, operator, approved);
    }
    
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address ownerAddr = LieAbilityNFTSimple.ownerOf(tokenId);
        return (spender == ownerAddr || isApprovedForAll(ownerAddr, spender) || getApproved(tokenId) == spender);
    }
    
    function _safeTransfer(address from, address to, uint256 tokenId, bytes memory /* data */) internal {
        _transfer(from, to, tokenId);
    }
    
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
} 