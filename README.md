# LieAbility - Authenticity Assessment with ZK-Verified NFT Certification

LieAbility is a cutting-edge application that analyzes user responses for authenticity and awards blockchain-verified NFT certificates to users who demonstrate high trust scores, enhanced with **VLayer Web Proofs** for cryptographic score verification.

## VLayer Web Proofs Integration

🔐 **Zero-Knowledge Score Verification**: Generate cryptographic proofs that your assessment scores are authentic without revealing sensitive biometric data.

🛡️ **Tamper-Proof Authenticity**: Use zkTLS technology to prove your scores came from legitimate AI analysis.

⚡ **Trustless Verification**: No need to trust centralized authorities - verify directly on the blockchain.

[📖 Read the VLayer Integration Guide](./docs/vlayer_integration.md)

## Features

- **AI-Powered Assessment**: Evaluates sentiment, confidence, facial expressions, and speech patterns
- **VLayer Web Proofs**: Cryptographic verification of assessment authenticity using zkTLS
- **Blockchain Verification**: Issues NFT certificates on Hedera testnet for qualifying users (≥75% trust score)
- **Zero-Knowledge Privacy**: Prove score authenticity without revealing sensitive biometric data
- **Secure Backend**: Server-side assessment verification and eligibility granting
- **MetaMask Integration**: Connect your wallet to mint and manage NFT certificates

## Architecture

- **Frontend**: React + TypeScript + Vite with MetaMask wallet integration
- **Backend**: Express.js API for secure assessment verification
- **VLayer Integration**: Web Proofs for cryptographic score verification
- **Blockchain**: Hedera testnet with ERC-721 NFT smart contract
- **Explorer**: BlockScout for contract verification and interaction

## Project Structure

```
LieAbility/
├── frontend/                     # React + Vite frontend application
│   ├── src/                      # Source code
│   │   ├── components/           # React components
│   │   │   └── VLayerProofComponent.tsx  # VLayer Web Proof UI
│   │   ├── services/             # Service layers
│   │   │   └── VLayerService.ts  # VLayer integration service
│   │   ├── hooks/                # Custom React hooks
│   │   └── utils/                # Utility functions
│   ├── public/                   # Static assets
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.ts            # Vite configuration
│   ├── tailwind.config.ts        # Tailwind CSS configuration
│   └── env.example               # Frontend environment variables
├── backend/                      # Express.js backend server
│   ├── server.js                 # Main server application
│   ├── package.json              # Backend dependencies
│   └── env.example               # Backend environment variables
├── contracts/                    # Smart contracts
│   ├── LieAbilityNFTSimple.sol   # Main NFT contract
│   ├── LieAbilityVerifier.sol    # VLayer proof verifier
│   └── AssessmentProver.sol      # VLayer proof generator
├── docs/                         # Documentation files
│   └── VLAYER_INTEGRATION.md     # VLayer integration guide
└── scripts/                      # Deployment scripts
```

## Quick Setup

### Prerequisites

- Node.js & npm installed
- Two terminal windows/tabs
- **VLayer SDK** for Web Proof generation

### Setup & Run

```sh
# Clone repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install VLayer SDK
npm install @vlayer/sdk
```

**Terminal 1 - Backend:**

```sh
cd backend
npm install
cp env.example .env
# Edit .env with your Hedera credentials
npm run dev
```

**Terminal 2 - Frontend:**

```sh
cd frontend
npm install
cp env.example .env
# Edit .env with your configuration
npm run dev
```

### Environment Configuration

**Frontend (.env in `/frontend` directory):**

```env
VITE_BACKEND_URL=http://localhost:3001
VITE_CONTRACT_ADDRESS=0.0.your_contract_id
VITE_VERIFIER_CONTRACT_ADDRESS=0x_your_vlayer_verifier_address
VITE_BLOCKSCOUT_URL=https://hashscan.io/testnet
VITE_NETWORK=testnet
```

**Backend (.env in `/backend` directory):**

```env
HEDERA_ACCOUNT_ID=0.0.your_account_id
HEDERA_PRIVATE_KEY=your_hedera_private_key
HEDERA_NETWORK=testnet
CONTRACT_ID=0.0.your_contract_id
ASSESSMENT_PRIVATE_KEY=your_assessment_signing_private_key
PORT=3001
FRONTEND_URL=http://localhost:5173
```

## How It Works

1. **Take Assessment**: Users complete an authenticity assessment
2. **AI Analysis**: Advanced AI analyzes facial expressions, speech patterns, and behavior
3. **Generate ZK Proof**: Create cryptographic proof of score authenticity using VLayer
4. **Connect Wallet**: Connect MetaMask to interact with the blockchain
5. **Submit Assessment**: Backend verifies the assessment and grants eligibility
6. **Verify Proof**: Submit VLayer proof to blockchain for tamper-proof verification
7. **Mint NFT**: Eligible users can mint their authenticity certificate NFT
8. **Verify on Blockchain**: View and verify certificates on BlockScout explorer

## VLayer Web Proofs Workflow

```
User Assessment → AI Analysis → VLayer Web Proof → Blockchain Verification → NFT Minting
     ↓                ↓              ↓                    ↓                    ↓
[Complete Test] → [Trust Score] → [ZK Proof] → [On-Chain Verify] → [Certificate NFT]
```

## Development Commands

```bash
# Frontend (from frontend/ directory)
npm run dev        # Start development server (http://localhost:5173)
npm run build      # Build for production
npm run preview    # Preview production build

# Backend (from backend/ directory)
npm run dev        # Start with nodemon (http://localhost:3001)
npm start          # Production start

# VLayer Integration
npm run vlayer:dev # Start VLayer development environment
npm run vlayer:deploy # Deploy VLayer contracts
```

## Backend API Endpoints

- `GET /health` - Health check
- `POST /api/submit-assessment` - Submit assessment for verification
- `GET /api/eligibility/:address` - Check eligibility status
- `GET /api/assessment` - VLayer-compatible assessment endpoint for proof generation

## Security Features

### Traditional Security

- Private keys are securely stored on the backend
- Assessment verification uses cryptographic signatures
- No sensitive data exposed in frontend environment variables
- Contract interactions are validated server-side

### VLayer Web Proof Security

- **zkTLS Technology**: Cryptographic proof of API response authenticity
- **Privacy-Preserving**: Proves score validity without revealing biometric data
- **Tamper-Proof**: Any modification to scores invalidates the proof
- **Trustless Verification**: No reliance on centralized authorities

## Technologies Used

- **Frontend**: Vite, TypeScript, React, shadcn-ui, Tailwind CSS
- **Backend**: Express.js, CORS, dotenv, mediapipe, tensorflow
- **VLayer**: Web Proofs SDK, zkTLS, Zero-Knowledge proofs
- **Blockchain**: Hedera SDK, ethers.js, ERC-721
- **Development**: Nodemon, MetaMask integration

## Getting Started with VLayer

1. **Install VLayer SDK**: Already included in dependencies
2. **Complete Assessment**: Take the LieAbility authenticity test
3. **Connect Wallet**: Use MetaMask or compatible wallet
4. **Generate Proof**: Click "Generate VLayer Web Proof" in results
5. **Verify On-Chain**: Submit proof to blockchain for permanent verification
6. **Mint Certificate**: Use verified assessment to mint NFT

For detailed VLayer integration information, see [vlayer_integration.md](./docs/vlayer_integration.md).

---

**Ready to prove your authenticity with cryptographic certainty?** 🚀

Try LieAbility with VLayer Web Proofs today!
