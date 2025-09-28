import { PrismaClient, SkillLevel } from '@prisma/client';
import { ethers } from 'ethers';
import { contractABI } from '../abi'; // You will need to save your contract's ABI to a file

const prisma = new PrismaClient();


const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.FLOW_RPC_URL; 

async function main() {
    console.log("Starting on-chain data sync for Flow...");

    if (!CONTRACT_ADDRESS || !RPC_URL) {
        throw new Error("CONTRACT_ADDRESS and FLOW_RPC_URL must be set in your .env file.");
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

    // 1. Get all available skills from the smart contract on Flow
    const allSkills = await contract.getAllSkills();
    console.log(`Found ${allSkills.length} skills on-chain:`, allSkills);

    for (const skillName of allSkills) {
        // 2. For each skill, get the list of users who have verified it
        const verifiedUsers = await contract.getVerifiedUsersForSkill(skillName);
        console.log(`Found ${verifiedUsers.length} verified users for skill: ${skillName}`);

        for (const userAddress of verifiedUsers) {
            console.log(` > Indexing ${skillName} for user ${userAddress}...`);

            // 3. For each user-skill pair, create a record in our fast database.
            // We use 'upsert' to avoid creating duplicates if we run the script again.
            await prisma.verifiedSkillProof.upsert({
                where: {
                    // A unique constraint is needed here. Let's create one.
                    // This assumes a developer can only prove a skill once.
                    developerWalletAddress_skillName: {
                        developerWalletAddress: userAddress,
                        skillName: skillName,
                    }
                },
                update: {}, // We don't need to update anything if it already exists
                create: {
                    attestationId: 'on-chain-placeholder', // In a real indexer, you'd get this from an event
                    mockHederaTxHash: 'flow-tx-placeholder', // Renamed for clarity
                    developerWalletAddress: userAddress,
                    // In a real indexer, you'd look up the user's profile info
                    developerGithubUsername: 'Fetched from DB', 
                    developerEnsName: 'Fetched from DB',
                    skillName: skillName,
                    // You'll need a way to map skill names to levels
                    skillLevel: SkillLevel.Intermediate, // Placeholder, you'd fetch this from your `skills` table
                    proofOfWorkUrl: 'on-chain-proof-url', // You'd get this from the `claims` mapping
                    verifiedAt: new Date(),
                }
            });
            console.log(`   >> Successfully indexed.`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        console.log("Sync complete. Prisma client disconnected.");
    });

