import { createPublicClient, createWalletClient, http, getContract } from 'viem';
import { flowTestnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { readFileSync } from 'fs';
import { join } from 'path';

async function main() {
  // Get the private key from environment
  const privateKey = process.env.FLOW_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('FLOW_PRIVATE_KEY environment variable is required');
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);

  // Create clients
  const publicClient = createPublicClient({
    chain: flowTestnet,
    transport: http(),
  });

  const walletClient = createWalletClient({
    account,
    chain: flowTestnet,
    transport: http(),
  });

  console.log('Deploying contracts with the account:', account.address);
  
  // Get account balance
  const balance = await publicClient.getBalance({ address: account.address });
  console.log('Account balance:', balance.toString());

  // Read the compiled contract
  const contractPath = join(__dirname, '../artifacts/contracts/SkillVerification.sol/SkillVerification.json');
  const contractData = JSON.parse(readFileSync(contractPath, 'utf8'));
  
  const bytecode = contractData.bytecode;
  const abi = contractData.abi;

  console.log('Deploying SkillVerification contract...');

  // Deploy the contract
  const hash = await walletClient.deployContract({
    abi,
    bytecode: bytecode as `0x${string}`,
  });

  console.log('Deployment transaction hash:', hash);

  // Wait for deployment
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  
  if (!receipt.contractAddress) {
    throw new Error('Contract deployment failed - no contract address in receipt');
  }

  console.log('SkillVerification deployed to:', receipt.contractAddress);
  
  // Test the new function
  const contract = getContract({
    address: receipt.contractAddress,
    abi,
    client: publicClient,
  });

  try {
    const challengeDetails = await contract.read.getAllChallengeDetails();
    console.log('✅ getAllChallengeDetails function works! Returned:', challengeDetails.length, 'challenges');
  } catch (error) {
    console.log('❌ getAllChallengeDetails function failed:', error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

