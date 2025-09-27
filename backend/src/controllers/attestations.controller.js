
import {
  createAttestation,
  challengeAttestation,
  resolveDispute,
  finalizeAttestation,
} from '../services/blockchain.service.js';

/**
 * @desc    Create a new attestation
 * @route   POST /api/attestations
 * @access  Public
 */
export const createAttestationHandler = async (req, res) => {
  try {
    const { claimantId, skillId, proofOfWorkUrl, stakeAmount } = req.body;
    const attestation = await createAttestation(
      claimantId,
      skillId,
      proofOfWorkUrl,
      stakeAmount
    );
    res.status(201).json(attestation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Challenge an attestation
 * @route   POST /api/attestations/:id/challenge
 * @access  Public
 */
export const challengeAttestationHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { challengerId, reason } = req.body;
    const attestation = await challengeAttestation(id, challengerId, reason);
    res.status(200).json(attestation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Resolve a dispute
 * @route   POST /api/attestations/:id/resolve
 * @access  Public
 */
export const resolveDisputeHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { claimantWins } = req.body;
    const attestation = await resolveDispute(id, claimantWins);
    res.status(200).json(attestation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Finalize an attestation
 * @route   POST /api/attestations/:id/finalize
 * @access  Public
 */
export const finalizeAttestationHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const attestation = await finalizeAttestation(id);
    res.status(200).json(attestation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
