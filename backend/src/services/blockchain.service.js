// import type { Attestation, SkillLevel } from '@prisma/client';
import { indexVerifiedAttestation } from './hypergraph.service.js';
import prisma from '../lib/prisma.js';

/**
 * Note on Schema:
 * The following functions assume the `Attestation` model has a `createdAt` timestamp
 * and the `AttestationStatus` enum includes a `CHALLENGED` state.
 * You may need to update your `schema.prisma` file accordingly.
 */

const AttestationStatus = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  CHALLENGED: 'CHALLENGED',
};

/**
 * Simulates creating a new skill attestation on-chain.
 *
 * @param claimantId - The ID of the user claiming the skill.
 * @param skillId - The ID of the skill being claimed.
 * @param proofOfWorkUrl - A URL to the proof of work.
 * @param stakeAmount - The amount staked for this attestation.
 * @returns The newly created attestation record.
 */
export const createAttestation = async (
  claimantId,
  skillId,
  proofOfWorkUrl,
  stakeAmount
) => {
  const newAttestation = await prisma.attestation.create({
    data: {
      claimantId,
      skillId,
      proofOfWorkUrl,
      stakeAmount,
      status: AttestationStatus.PENDING,
    },
  });
  return newAttestation;
};

/**
 * Simulates challenging an existing attestation on-chain.
 *
 * @param attestationId - The ID of the attestation to challenge.
 * @param challengerId - The ID of the user challenging the attestation.
 * @param reason - The reason for the challenge.
 * @returns The updated attestation record.
 */
export const challengeAttestation = async (
  attestationId,
  challengerId,
  reason
) => {
  const attestation = await prisma.attestation.findUnique({
    where: { id: attestationId },
  });

  if (!attestation) {
    throw new Error('Attestation not found');
  }

  if (attestation.status !== AttestationStatus.PENDING) {
    throw new Error('Attestation is not in PENDING state and cannot be challenged');
  }

  const updatedAttestation = await prisma.attestation.update({
    where: { id: attestationId },
    data: {
      challengerId,
      status: AttestationStatus.CHALLENGED,
      // note: A `challengeReason` field could be added to the schema to store the `reason`.
    },
  });

  return updatedAttestation;
};

/**
 * Simulates resolving a dispute for a challenged attestation.
 *
 * @param attestationId - The ID of the attestation in dispute.
 * @param claimantWins - A boolean indicating if the claimant won the dispute.
 * @returns The resolved attestation record.
 */
export const resolveDispute = async (
  attestationId,
  claimantWins
) => {
  const attestation = await prisma.attestation.findUnique({
    where: { id: attestationId },
    include: {
      skill: true,
      claimant: true,
    },
  });

  if (!attestation) {
    throw new Error('Attestation not found');
  }

  if (attestation.status !== AttestationStatus.CHALLENGED) {
    throw new Error('Attestation is not in a CHALLENGED state');
  }

  const newStatus = claimantWins ? AttestationStatus.VERIFIED : AttestationStatus.REJECTED;

  const updatedAttestation = await prisma.attestation.update({
    where: { id: attestationId },
    data: {
      status: newStatus,
    },
    include: {
      skill: true,
      claimant: true,
    },
  });

  if (newStatus === AttestationStatus.VERIFIED) {
    await indexVerifiedAttestation({
      attestationId: updatedAttestation.id,
      developerWalletAddress: updatedAttestation.claimant.walletAddress,
      skillName: updatedAttestation.skill.name,
      skillLevel: updatedAttestation.skill.level ,
      proofOfWorkUrl: updatedAttestation.proofOfWorkUrl,
    });
  }

  return updatedAttestation;
};

/**
 * Simulates finalizing an attestation after the challenge period has passed without challenges.
 *
 * @param attestationId - The ID of the attestation to finalize.
 * @returns The finalized attestation record.
 */
export const finalizeAttestation = async (attestationId) => {
  const attestation = await prisma.attestation.findUnique({
    where: { id: attestationId },
    include: {
      skill: true,
      claimant: true,
    },
  });

  if (!attestation) {
    throw new Error('Attestation not found');
  }

  if (attestation.status !== AttestationStatus.PENDING) {
    throw new Error('Attestation is not in a PENDING state');
  }

  // Assuming `createdAt` is part of the Attestation model
  const challengePeriod = 3 * 1000; // 3 days // 3 * 24 * 60 * 60 * 1000
  const createdAt = (attestation).createdAt.getTime();
  const now = new Date().getTime();
  console.log("Now: "+ now + "created at: " + createdAt);
  if (now - createdAt < challengePeriod) {
    throw new Error('Challenge period has not yet passed');
  }

  const updatedAttestation = await prisma.attestation.update({
    where: { id: attestationId },
    data: {
      status: AttestationStatus.VERIFIED,
    },
    include: {
      skill: true,
      claimant: true,
    },
  });

  await indexVerifiedAttestation({
    attestationId: updatedAttestation.id,
    developerWalletAddress: updatedAttestation.claimant.walletAddress,
    skillName: updatedAttestation.skill.name,
    skillLevel: updatedAttestation.skill.level ,
    proofOfWorkUrl: updatedAttestation.proofOfWorkUrl,
  });

  return updatedAttestation;
};
