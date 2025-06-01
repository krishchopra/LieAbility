# LieAbility - Authenticity Assessment with NFT Certification

LieAbility is a cutting-edge application that analyzes user responses for authenticity and awards blockchain-verified NFT certificates to users who demonstrate high trust scores.

## Features

- **AI-Powered Assessment**: Evaluates sentiment, confidence, facial expressions, and speech patterns
- **Blockchain Verification**: Issues NFT certificates on Hedera testnet for qualifying users (≥75% trust score)
- **Secure Backend**: Server-side assessment verification and eligibility granting
- **MetaMask Integration**: Connect your wallet to mint and manage NFT certificates

## Architecture

- **Frontend**: React + TypeScript + Vite with MetaMask wallet integration
- **Backend**: Express.js API for secure assessment verification
- **Blockchain**: Hedera testnet with ERC-721 NFT smart contract
- **Explorer**: BlockScout for contract verification and interaction

## Project Structure

```
LieAbility/
├── frontend/                     # React + Vite frontend application
│   ├── src/                      # Source code
│   │   ├── components/           # React components
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
├── scripts/                      # Deployment scripts
└── docs/                         # Documentation files
```

## Quick Setup

### Prerequisites

- Node.js & npm installed
- Two terminal windows/tabs

### Setup & Run

```sh
# Clone repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
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

That's it! Both services will run independently.

### Environment Configuration

**Frontend (.env in `/frontend` directory):**

```env
VITE_BACKEND_URL=http://localhost:3001
VITE_CONTRACT_ADDRESS=0.0.your_contract_id
VITE_BLOCKSCOUT_URL=https://hashscan.io/testnet
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
2. **Connect Wallet**: Connect MetaMask to interact with the blockchain
3. **Submit Assessment**: Backend verifies the assessment and grants eligibility
4. **Mint NFT**: Eligible users can mint their authenticity certificate NFT
5. **Verify on Blockchain**: View and verify certificates on BlockScout explorer

## Development Commands

```bash
# Frontend (from frontend/ directory)
npm run dev        # Start development server (http://localhost:5173)
npm run build      # Build for production
npm run preview    # Preview production build

# Backend (from backend/ directory)
npm run dev        # Start with nodemon (http://localhost:3001)
npm start          # Production start
```

## Backend API Endpoints

- `GET /health` - Health check
- `POST /api/submit-assessment` - Submit assessment for verification
- `GET /api/eligibility/:address` - Check eligibility status

## Security

- Private keys are securely stored on the backend
- Assessment verification uses cryptographic signatures
- No sensitive data exposed in frontend environment variables
- Contract interactions are validated server-side

## Technologies Used

- **Frontend**: Vite, TypeScript, React, shadcn-ui, Tailwind CSS
- **Backend**: Express.js, CORS, dotenv, mediapipe, tensorflow
- **Blockchain**: Hedera SDK, ethers.js, ERC-721
- **Development**: Nodemon, MetaMask integration
