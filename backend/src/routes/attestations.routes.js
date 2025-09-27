import { Router } from 'express';
import {
  createAttestationHandler,
  challengeAttestationHandler,
  resolveDisputeHandler,
  finalizeAttestationHandler,
} from '../controllers/attestations.controller.js';

const router = Router();

router.post('/', createAttestationHandler);
router.post('/:id/challenge', challengeAttestationHandler);
router.post('/:id/resolve', resolveDisputeHandler);
// Finalise is to automatically change the status in a "Happy State"

router.post('/:id/finalize', finalizeAttestationHandler);

export default router;
