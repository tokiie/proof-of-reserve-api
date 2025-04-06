import express from 'express';
import { MerkleController } from '../controllers/merkleController';
import { MerkleTreeService } from '../services/MerkleTreeService';
import { User } from '../types/User';

// Sample data - replace with database in production
const sampleUsers: User[] = [
  { id: 1, balance: 100 },
  { id: 2, balance: 200 },
  { id: 3, balance: 300 },
  { id: 4, balance: 400 },
  { id: 5, balance: 500 },
];

// Sets up all Merkle tree related routes
export function getMerkleRouter(): express.Router {
  const router = express.Router();
  const merkleTreeService = new MerkleTreeService(sampleUsers);
  const merkleController = new MerkleController(merkleTreeService);

  // Get the current Merkle root hash
  router.get('/root', merkleController.getMerkleRoot);

  // Get a proof for a specific user's balance
  router.get('/proof/:userId', merkleController.getMerkleProof);

  // Verify a proof for a user's balance
  router.post('/verify', merkleController.verifyProof);

  return router;
}