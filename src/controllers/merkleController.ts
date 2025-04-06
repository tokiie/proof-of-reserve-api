import { Request, Response } from 'express';
import { MerkleTreeService } from '../services/MerkleTreeService';

// Handles all the Merkle tree related API endpoints
export class MerkleController {
  private merkleTreeService: MerkleTreeService;

  /**
   * Create a new MerkleController
   *
   * @param merkleTreeService - The MerkleTreeService instance to use
   */
  constructor(merkleTreeService: MerkleTreeService) {
    this.merkleTreeService = merkleTreeService;
  }

  // Returns the current Merkle root hash
  public getMerkleRoot = (req: Request, res: Response): void => {
    const rootHex = this.merkleTreeService.getMerkleRoot();
    res.json({ merkleRoot: rootHex });
  };

  // Generates a proof for a specific user's balance
  // Returns 400 if userId is invalid, 404 if user doesn't exist
  public getMerkleProof = (req: Request, res: Response): void => {
    const userIdParam = req.params.userId;
    const userId = Number(userIdParam);

    if (!Number.isInteger(userId) || userId <= 0) {
      res.status(400).json({ error: 'Invalid userId format' });
      return;
    }

    const proofData = this.merkleTreeService.generateProofForUser(userId);

    if (!proofData) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(proofData);
  };

  // Verifies a proof for a user's balance
  // Optionally checks against a provided Merkle root
  public verifyProof = (req: Request, res: Response): void => {
    const { userId, balance, proof, merkleRoot } = req.body;

    if (!userId || !balance || !proof || !Array.isArray(proof)) {
      res.status(400).json({ error: 'Missing or invalid required fields' });
      return;
    }

    const isValid = this.merkleTreeService.verifyProof(userId, balance, proof);

    // Optional: verify against a specific root hash
    let matchesProvidedRoot = true;
    if (merkleRoot) {
      matchesProvidedRoot = merkleRoot === this.merkleTreeService.merkleRoot;
    }

    res.json({
      isValid: isValid && matchesProvidedRoot,
      calculatedRoot: this.merkleTreeService.merkleRoot,
      providedRoot: merkleRoot || null
    });
  };
}