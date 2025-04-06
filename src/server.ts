import express from 'express';
import { json } from 'body-parser';
import { getMerkleRouter } from './routes/merkleRoutes';
import { users } from './data/users';
import { MerkleTree } from 'merkle-tree-lib';
import { HashStrategyFactory, HashStrategyType, ProofDirection } from 'merkle-tree-lib';
import { errorHandler } from './middleware/errorHandler';
import { config } from './config/config';

// Create Express application
const app = express();

// Middleware
app.use(json());

// Define tags
const LEAF_TAG = config.merkleTree.leafTag;
const BRANCH_TAG = config.merkleTree.branchTag;

// Create hash strategies
const leafHashStrategy = HashStrategyFactory.createStrategy(
  HashStrategyType.TAGGED_SHA256,
  { tag: LEAF_TAG }
);

const branchHashStrategy = HashStrategyFactory.createStrategy(
  HashStrategyType.TAGGED_SHA256,
  { tag: BRANCH_TAG }
);

// Format user data for the Merkle tree
const formatUserData = (user: { id: number, balance: number }): string => {
  return `(${user.id},${user.balance})`;
};

// Build the Merkle tree from user data for backward compatibility
const leaves = users.map(user => formatUserData(user));
const merkleTree = new MerkleTree(leaves, leafHashStrategy, branchHashStrategy);

// API base URL
const API_BASE = config.server.apiBase;

// Register the Merkle routes
app.use(`${API_BASE}/merkle`, getMerkleRouter());

// For backward compatibility, add the original routes
app.get('/merkle-root', (req, res) => {
  const rootHex = merkleTree.getRootHex();
  res.json({ merkleRoot: rootHex });
});

app.get('/merkle-proof/:userId', (req, res) => {
  const userIdParam = req.params.userId;
  const userId = Number(userIdParam);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: 'Invalid userId format' });
  }

  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const index = users.findIndex(u => u.id === userId);
  const proof = merkleTree.generateProof(index);

  const proofOutput = proof.getElements().map(item => [
    item.siblingHash.toString('hex'),
    item.direction
  ]);

  res.json({
    userId: user.id,
    balance: user.balance,
    proof: proofOutput
  });
});

// Add error handling middleware
app.use(errorHandler);

// Start the server if running directly
if (require.main === module) {
  const PORT = config.server.port;
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    console.log(`API base URL: ${API_BASE}`);
    console.log(`Environment: ${config.env.isDevelopment ? 'development' : config.env.isProduction ? 'production' : 'test'}`);
  });
}

// Export for testing
export { app, merkleTree, LEAF_TAG, BRANCH_TAG };