import express from 'express';
import { MerkleTree } from 'merkle-tree-lib';
import { users } from './data/users';

const app = express();

// Define the tags for Proof of Reserve (Part 2)
const LEAF_TAG = 'ProofOfReserve_Leaf';
const BRANCH_TAG = 'ProofOfReserve_Branch';

// Build the Merkle tree for all users in memory (we use id and balance serialized as "(id,balance)")
const leaves = users.map(user => `(${user.id},${user.balance})`);
const merkleTree = new MerkleTree(leaves, LEAF_TAG, BRANCH_TAG);

// GET /merkle-root: Returns the Merkle root of all users
app.get('/merkle-root', (req, res) => {
  const rootHex = merkleTree.getHexRoot();
  return res.json({ merkleRoot: rootHex });
});

// GET /merkle-proof/:userId: Returns the balance and Merkle proof for the given user
app.get('/merkle-proof/:userId', (req, res) => {
  const userIdParam = req.params.userId;
  const userId = Number(userIdParam);
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: 'Invalid userId format' });
  }
  // Find the user by ID
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  // Determine the index of this user in the leaves array
  const index = users.findIndex(u => u.id === userId);
  const proof = merkleTree.getProof(index);
  // Format the proof for output: [hexHash, side]
  const proofOutput = proof.map(item => [item.siblingHash.toString('hex'), item.side]);
  return res.json({
    userId: user.id,
    balance: user.balance,
    proof: proofOutput
  });
});

export { app, merkleTree, LEAF_TAG, BRANCH_TAG };

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}