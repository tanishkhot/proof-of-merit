# Contract Deployment Guide

## Current Status
The frontend is currently using contract address: `0x680804c33D2fD7935e3B585c26B51419d6a8071F`

This deployed contract does **NOT** include the new `getAllChallengeDetails()` function that was added to the Solidity contract.

## What's New in the Contract
The updated `SkillVerification.sol` contract includes:
1. New `ChallengeDetails` struct
2. New `getAllChallengeDetails()` function that returns comprehensive challenge information

## Frontend Fallback Behavior
The frontend has been updated to:
- Try to call `getAllChallengeDetails()` first
- Fall back to `getPendingClaimsDetails()` if the new function is not available
- Display a user-friendly message when using fallback data
- Continue to work with the existing contract functionality

## To Deploy the Updated Contract

### Option 1: Using the Viem Deployment Script
```bash
cd contracts
# Set your private key
export FLOW_PRIVATE_KEY="your_private_key_here"
# Deploy the contract
npx hardhat run scripts/deploy-viem.ts --network flow-testnet
```

### Option 2: Using the Original Deployment Script (if ethers is properly configured)
```bash
cd contracts
# Set your private key
export FLOW_PRIVATE_KEY="your_private_key_here"
# Deploy the contract
npx hardhat run scripts/deploy-flow.ts --network flow-testnet
```

### After Deployment
1. Update the contract address in `frontend/src/lib/contracts.ts`:
   ```typescript
   export const SKILL_VERIFICATION_ADDRESS = "NEW_CONTRACT_ADDRESS";
   ```

2. Restart the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

## Current Functionality
Even without the new contract deployment, the application works with:
- ✅ Skill verification and claiming
- ✅ Challenge creation and voting
- ✅ Challenge resolution
- ✅ User profile management
- ⚠️ Limited challenge details (using fallback data)

## Testing the New Function
Once deployed, you can test the new `getAllChallengeDetails()` function by:
1. Creating some skill claims
2. Challenging some claims
3. Visiting the `/resolve` page
4. The page should show detailed challenge information instead of the fallback message

## Troubleshooting
- If you see "Using Fallback Data" message, the contract hasn't been redeployed yet
- If you see WagmiProvider errors, clear the browser cache and restart the dev server
- If deployment fails, check that your private key has sufficient FLOW testnet tokens

