# Transaction Troubleshooting Guide

## Common Transaction Failure Issues

### 1. **Insufficient Balance**
**Symptoms**: Transaction fails with "insufficient funds" or similar error
**Solution**: 
- You need FLOW tokens to pay for gas fees
- Get testnet FLOW from: https://testnet-faucet.onflow.org/
- Or use other Flow testnet faucets

### 2. **Wrong Network**
**Symptoms**: "Unsupported chain" or "wrong network" errors
**Solution**:
- Switch to Flow Testnet (Chain ID: 545)
- Add Flow Testnet to your wallet if not present
- Network details:
  - RPC URL: https://testnet.evm.nodes.onflow.org
  - Chain ID: 545
  - Symbol: FLOW

### 3. **Contract Not Found**
**Symptoms**: "Contract not found" or "function not found" errors
**Solution**:
- Verify contract is deployed at: `0x09aB660CEac220678b42E0e23DebCb1475e1eAD5`
- Check if you're on the correct network
- Ensure contract ABI matches deployed contract

### 4. **RPC Connection Issues**
**Symptoms**: "Failed to fetch" or network timeout errors
**Solution**:
- Check internet connection
- Try refreshing the page
- The RPC endpoint might be temporarily down

### 5. **Function Not Available**
**Symptoms**: "Function not found" or ABI errors
**Solution**:
- Some functions might not exist in the deployed contract
- Check if the function is available in the contract
- The contract might need skills to be added first

## Debugging Steps

1. **Check the Transaction Debugger** (top-left corner in development)
2. **Verify your wallet connection**
3. **Check your balance**
4. **Ensure you're on Flow Testnet**
5. **Try a simple read operation first** (like viewing available skills)

## Getting Testnet FLOW

1. Visit: https://testnet-faucet.onflow.org/
2. Enter your wallet address
3. Request testnet FLOW tokens
4. Wait for confirmation

## Network Configuration

### Flow Testnet Details:
- **Network Name**: Flow Testnet
- **RPC URL**: https://testnet.evm.nodes.onflow.org
- **Chain ID**: 545
- **Currency Symbol**: FLOW
- **Block Explorer**: https://testnet.flowscan.org

## Contract Information

- **Contract Address**: `0x09aB660CEac220678b42E0e23DebCb1475e1eAD5`
- **Network**: Flow Testnet (Chain ID: 545)
- **Deployed**: September 27, 2025

## Still Having Issues?

1. Check browser console for detailed error messages
2. Try with a different wallet (MetaMask, etc.)
3. Clear browser cache and try again
4. Ensure you have the latest version of your wallet