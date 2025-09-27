
import prisma from '../lib/prisma.js';

export const getAllVerifiedSkillProofs = async () => {
  return await prisma.verifiedSkillProof.findMany();
};

export const indexVerifiedAttestation = async (data) => {
  const {
    attestationId,
    developerWalletAddress,
    skillName,
    skillLevel,
    proofOfWorkUrl,
  } = data;

  // Generate a random mock Hedera transaction hash
  const mockHederaTxHash = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;

  return await prisma.verifiedSkillProof.create({
    data: {
      attestationId,
      developerWalletAddress,
      skillName,
      skillLevel,
      proofOfWorkUrl,
      mockHederaTxHash,
      verifiedAt: new Date(),
    },
  });
};
