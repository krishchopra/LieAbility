# LieAbility Backend - Implementation Guide

## 🎯 Purpose

Secure backend implementation for LieAbility that handles assessment verification and blockchain eligibility granting, removing security vulnerabilities from the frontend.

## 🏗️ Implemented Architecture

```
Frontend Assessment → Backend API → Smart Contract → Hedera Blockchain
       ↓                 ↓              ↓              ↓
   Trust Score    → Verification → Eligibility → NFT Certificate
  (Client-side)    (Server-side)   Granting      Minting
```

## ✅ What's Implemented

### **1. Secure Backend API**

**Technology Stack:**

- Express.js server with CORS configuration
- Hedera SDK for blockchain interactions
- Cryptographic signature verification
- Environment-based configuration

**Key Files:**

- `backend/server.js` - Main Express server
- `backend/package.json` - Dependencies and scripts
- `backend/env.example` - Environment configuration template

### **2. API Endpoints**

```javascript
GET /health
// Health check endpoint
// Returns: { status: 'healthy', timestamp, hedera: 'connected' }

POST /api/submit-assessment
// Submit assessment for verification and eligibility granting
// Body: { userAddress: string, trustScore: number }
// Returns: { success: boolean, message, data }

GET /api/eligibility/:address
// Check eligibility status for an address
// Returns: { success: boolean, data }
```

### **3. Frontend Integration**

**Updated Files:**

- `src/hooks/useNFTContract.ts` - Backend API integration
- `src/components/ResultsScreen.tsx` - Secure assessment submission

**Removed Vulnerable Files:**

- `src/utils/assessment-proof.ts` ❌ (Exposed private keys)
- `src/hooks/useNFTContract-SelfService.ts` ❌ (Client-side eligibility)
- `src/components/ResultsScreen-SelfService.tsx` ❌ (Insecure workflow)

## 🚀 Quick Start

### **1. Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
cp env.example .env
# Edit .env with your Hedera credentials

# Start development server
npm run dev
```

### **2. Environment Variables Required**

**Backend (.env):**

```env
# Hedera Configuration
HEDERA_ACCOUNT_ID=0.0.your_account_id
HEDERA_PRIVATE_KEY=your_hedera_private_key
HEDERA_NETWORK=testnet

# Smart Contract
CONTRACT_ID=0.0.your_contract_id

# Assessment Verification
ASSESSMENT_PRIVATE_KEY=your_assessment_signing_private_key

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env):**

```env
# Safe, non-sensitive configuration only
VITE_BACKEND_URL=http://localhost:3001
VITE_CONTRACT_ADDRESS=0.0.your_contract_id
VITE_BLOCKSCOUT_URL=https://hashscan.io/testnet
```

## 🔒 Security Improvements

### **Before (Vulnerable)**

```javascript
❌ Private keys exposed in frontend environment variables
❌ Client-side proof generation (easily hackable)
❌ Self-service eligibility claiming
❌ No server-side validation
```

### **After (Secure)**

```javascript
✅ Private keys secured on backend server
✅ Server-side assessment verification
✅ Cryptographic signature validation
✅ Backend-controlled eligibility granting
✅ No sensitive data in frontend environment
```

## 🔄 New User Flow

1. **Complete Assessment**: Frontend generates random trust score (75-100%)
2. **Connect Wallet**: User connects MetaMask wallet
3. **Submit Assessment**: Backend API receives score and user address
4. **Server Verification**: Backend validates score and generates cryptographic proof
5. **Blockchain Transaction**: Backend calls `grantEligibility()` on smart contract
6. **Mint NFT**: User can now mint their certificate NFT

## 🛠️ Development Commands

```bash
# Frontend (from frontend/ directory)
cd frontend
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build

# Backend (from backend/ directory)
cd backend
npm run dev        # Development with nodemon
npm start          # Production start
```

## 📊 API Request Examples

### **Submit Assessment**

```javascript
POST http://localhost:3001/api/submit-assessment
Content-Type: application/json

{
  "userAddress": "0x742d35Cc6634C0532925a3b8D61d4d2b65C3b4C1",
  "trustScore": 87
}
```

### **Health Check**

```javascript
GET http://localhost:3001/health

Response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "hedera": "connected"
}
```

## 🚨 Important Security Notes

### **Development vs Production**

**Current Setup (Development):**

- ✅ Perfect for localhost testing
- ✅ Testnet deployment safe
- ✅ Private keys secured on backend
- ✅ No frontend vulnerabilities

**For Production Deployment:**

- Use secure key management (AWS KMS, HashiCorp Vault)
- Implement rate limiting and request validation
- Add authentication and user management
- Use HTTPS and secure headers
- Implement comprehensive logging and monitoring

### **Assessment Score Generation**

**Current Implementation:**

- Random score generation (75-100%) for demo purposes
- Replace with actual assessment logic in production

**For Real Assessment:**

```javascript
// Replace random generation with actual analysis
const assessmentResult = await analyzeUserBehavior(
  videoData,
  audioData,
  responses
);
const trustScore = assessmentResult.score;
```

## 📁 Project Structure

```
LieAbility/
├── frontend/                     # React + Vite frontend application
│   ├── src/                      # Source code
│   │   ├── components/           # React components
│   │   │   └── ResultsScreen.tsx # Assessment results and NFT minting
│   │   ├── hooks/                # Custom React hooks
│   │   │   └── useNFTContract.ts # Backend API integration
│   │   └── utils/                # Utility functions
│   │       └── blockscout.ts     # BlockScout explorer integration
│   ├── public/                   # Static assets
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.ts            # Vite configuration
│   ├── tailwind.config.ts        # Tailwind CSS configuration
│   └── env.example               # Frontend environment variables
├── backend/                      # Express.js backend server
│   ├── server.js                 # Main Express application
│   ├── package.json              # Backend dependencies
│   └── env.example               # Backend environment variables
├── contracts/                    # Smart contracts
│   └── LieAbilityNFT.sol        # ERC-721 NFT contract
├── scripts/                      # Deployment scripts
│   ├── deploy.js                 # Contract deployment
│   └── verify.js                 # BlockScout verification
└── docs/                         # Documentation files
    ├── HEDERA_SETUP.md           # Hedera blockchain setup
    ├── README_NFT_IMPLEMENTATION.md
    └── backend-requirements.md   # This file
```

## 🎯 Next Steps

1. **Deploy Smart Contract**: Use existing deployment scripts
2. **Configure Environment**: Set up Hedera account and private keys
3. **Start Services**: Run both frontend and backend servers
4. **Test Flow**: Complete assessment → submit → mint NFT
5. **Verify on BlockScout**: View transactions on Hedera explorer

## 📞 Support

For issues or questions:

- Check `HEDERA_SETUP.md` for blockchain setup
- Review `README_NFT_IMPLEMENTATION.md` for smart contract details
- Verify environment variables are properly configured
- Ensure both frontend and backend servers are running
