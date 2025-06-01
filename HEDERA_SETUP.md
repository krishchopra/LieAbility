# Hedera & BlockScout Setup Guide

This guide will help you deploy and verify your LieAbility NFT contract on Hedera with automated BlockScout integration.

## 🏗️ Deployment with Auto-Verification

### Quick Start

```bash
# Deploy and auto-verify in one command
npm run deploy

# Check verification status
npm run verify:check

# Manual verification if auto-verify failed
npm run verify

# Show contract links
npm run verify:links
```

### Step 1: Environment Setup

1. Get Hedera account and keys from [Hedera Portal](https://portal.hedera.com)
2. Fund your account with HBAR (testnet faucet available)
3. Add to `.env`:

```env
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=your_ed25519_private_key_here
VITE_CONTRACT_ADDRESS=will_be_set_after_deployment
```

### Step 2: Deploy Contract

```bash
npm run deploy
```

This will:

- Deploy your contract to Hedera
- Automatically attempt BlockScout verification
- Generate deployment.json with contract info
- Provide all necessary links and next steps

### Step 3: Verification Process

#### ✅ **Automated Verification** (Preferred)

The deployment script now includes **automatic BlockScout verification**:

1. **During Deployment**: Verification happens automatically
2. **Manual Trigger**: `npm run verify`
3. **Status Check**: `npm run verify:check`

#### 🔧 **Manual Verification** (Fallback)

If auto-verification fails:

1. Run `npm run verify:links` to get URLs
2. Go to the "Source Code" link
3. Click "Verify & Publish"
4. Use these settings:
   - **Compiler Version**: `v0.8.9+commit.e5eed63a`
   - **Optimization**: Enabled (200 runs)
   - **Source Code**: Use flattened contract from verification script

### Step 4: Grant User Eligibility

After deployment, grant eligibility to users who score ≥75:

```bash
# Example script (modify with real addresses/scores)
npm run deploy:grant-eligibility
```

Or programmatically:

```javascript
const { grantEligibility } = require("./src/utils/hedera");
await grantEligibility(contractId, [userAddress], [userScore]);
```

## 🌐 **Enhanced BlockScout Integration**

### **What's New:**

- **Automatic Verification**: Deploy + verify in one command
- **Status Monitoring**: Check verification status programmatically
- **Smart UI Links**: Direct links to all contract interfaces
- **Fallback Options**: Manual verification guides if auto-verify fails

### **Available Commands:**

```bash
# Deployment
npm run deploy              # Deploy + auto-verify
npm run contract:deploy     # Deploy only

# Verification
npm run verify              # Manual verification
npm run verify:check        # Check status
npm run verify:links        # Show all contract URLs

# User Management
npm run deploy:grant-eligibility  # Grant to test users
```

### **BlockScout Features:**

1. **📊 Overview**: Contract stats and transactions
2. **📝 Source Code**: Verified contract source (if verified)
3. **📖 Read Contract**: Query contract state
4. **✍️ Write Contract**: Direct contract interaction
5. **🔍 Events**: Contract event logs

### **UI Integration:**

Your React app now includes:

- **Verification Status**: Real-time verification checking
- **Smart Links**: Context-aware BlockScout buttons
- **Alternative Minting**: "Mint via BlockScout" option
- **Explorer Access**: Direct links to all contract interfaces

### **Verification Benefits:**

- ✅ **Trust**: Users can verify contract code
- ✅ **Transparency**: Open source verification
- ✅ **Interaction**: Direct BlockScout interface
- ✅ **Debugging**: Better error tracking
- ✅ **Analytics**: Enhanced contract monitoring

## 🚀 **Production Deployment**

### **Mainnet Deployment:**

1. Switch to mainnet in your environment:

```env
HEDERA_NETWORK=mainnet
```

2. Use mainnet account and keys
3. Deploy with same commands:

```bash
npm run deploy
```

### **Verification Checklist:**

- [ ] Contract deployed successfully
- [ ] Auto-verification completed
- [ ] Manual verification if needed
- [ ] All contract links accessible
- [ ] User eligibility system working
- [ ] Frontend integration tested
- [ ] BlockScout interactions verified

## 🔧 **Troubleshooting**

### **Verification Issues:**

1. **Auto-verification failed**: Run `npm run verify` manually
2. **Source mismatch**: Check compiler version and optimization
3. **API errors**: Verify network connectivity
4. **Missing source**: Ensure flattened contract is complete

### **Common Solutions:**

- Ensure exact compiler version match
- Check optimization settings (200 runs)
- Verify all imports are flattened
- Confirm constructor arguments match
- Check network configuration

### **Support Links:**

- [Hedera Documentation](https://docs.hedera.com)
- [HashScan Explorer](https://hashscan.io)
- [BlockScout Documentation](https://docs.blockscout.com)

## 📊 **Monitoring & Analytics**

Post-deployment monitoring:

```bash
# Check verification status
npm run verify:check

# View contract stats
npm run verify:links
```

Access comprehensive analytics through BlockScout's interface for transaction monitoring, user interactions, and contract performance metrics.
