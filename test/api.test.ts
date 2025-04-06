import request from 'supertest';
import { app, merkleTree, LEAF_TAG, BRANCH_TAG } from '../src/server';
import { users } from '../src/data/users';
import { HashStrategyFactory, HashStrategyType } from 'merkle-tree-lib';
import { ProofDirection } from 'merkle-tree-lib';

// API base URL
const API_BASE = '/api';

describe('Proof of Reserve API Endpoints', () => {
  // Test legacy endpoint
  describe('Legacy API', () => {
    it('GET /merkle-root should return the correct Merkle root', async () => {
      const res = await request(app).get('/merkle-root');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('merkleRoot');
      const rootHex = res.body.merkleRoot;
      // Check that it is a 64-character hex string
      expect(rootHex).toMatch(/^[0-9a-f]{64}$/);
      // It should match the MerkleTree's computed root
      expect(rootHex).toEqual(merkleTree.getRootHex());
    });

    it('GET /merkle-proof/:userId should return balance and proof for a valid user', async () => {
      const user = users[2];  // user with id = 3 (third in the list)
      const res = await request(app).get(`/merkle-proof/${user.id}`);
      expect(res.status).toBe(200);
      expect(res.body.userId).toBe(user.id);
      expect(res.body.balance).toBe(user.balance);
      expect(Array.isArray(res.body.proof)).toBe(true);

      // Verify that the proof hashes to the same root
      const proof = res.body.proof as [string, ProofDirection][];
      // Create hash strategy for verification
      const hashStrategy = HashStrategyFactory.createStrategy(
        HashStrategyType.TAGGED_SHA256,
        { tag: LEAF_TAG }
      );

      // Compute the leaf hash
      const leafData = Buffer.from(`(${user.id},${user.balance})`, 'utf8');
      let currentHash = hashStrategy.hash(leafData);

      // Get branch hash strategy
      const branchHashStrategy = HashStrategyFactory.createStrategy(
        HashStrategyType.TAGGED_SHA256,
        { tag: BRANCH_TAG }
      );

      // Iterate through proof elements
      for (const [siblingHex, direction] of proof) {
        const siblingHash = Buffer.from(siblingHex, 'hex');
        // Combine the hashes based on the direction
        const combinedData = direction === ProofDirection.LEFT
          ? Buffer.concat([siblingHash, currentHash])
          : Buffer.concat([currentHash, siblingHash]);
        currentHash = branchHashStrategy.hash(combinedData);
      }

      const calculatedRoot = currentHash.toString('hex');
      // Compare with root from the MerkleTree
      expect(calculatedRoot).toEqual(merkleTree.getRootHex());
    });

    it('GET /merkle-proof/:userId should return 404 for nonexistent user', async () => {
      const res = await request(app).get('/merkle-proof/99');  // no user with id 99
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('User not found');
    });

    it('GET /merkle-proof/:userId should return 400 for invalid userId format', async () => {
      const res = await request(app).get('/merkle-proof/abc');  // invalid ID format
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid userId format');
    });
  });

  // Test new API
  describe('New API', () => {
    it('GET /api/merkle/root should return the correct Merkle root', async () => {
      const res = await request(app).get(`${API_BASE}/merkle/root`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('merkleRoot');
      const rootHex = res.body.merkleRoot;
      // Check that it is a 64-character hex string
      expect(rootHex).toMatch(/^[0-9a-f]{64}$/);
      // It should match the MerkleTree's computed root
      expect(rootHex).toEqual(merkleTree.getRootHex());
    });

    it('GET /api/merkle/proof/:userId should return balance and proof for a valid user', async () => {
      const user = users[2];  // user with id = 3 (third in the list)
      const res = await request(app).get(`${API_BASE}/merkle/proof/${user.id}`);
      expect(res.status).toBe(200);
      expect(res.body.userId).toBe(user.id);
      expect(res.body.balance).toBe(user.balance);
      expect(Array.isArray(res.body.proof)).toBe(true);
    });

    it('POST /api/merkle/verify should verify a valid proof', async () => {
      // First get a proof
      const user = users[1];  // user with id = 2
      const proofRes = await request(app).get(`${API_BASE}/merkle/proof/${user.id}`);
      const { userId, balance, proof } = proofRes.body;

      // Then verify it
      const verifyRes = await request(app)
        .post(`${API_BASE}/merkle/verify`)
        .send({ userId, balance, proof });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.isValid).toBe(true);
      expect(verifyRes.body.calculatedRoot).toEqual(merkleTree.getRootHex());
    });

    it('POST /api/merkle/verify should reject an invalid proof', async () => {
      // First get a proof
      const user = users[1];  // user with id = 2
      const proofRes = await request(app).get(`${API_BASE}/merkle/proof/${user.id}`);
      const { userId, proof } = proofRes.body;

      // Then verify it with wrong balance
      const verifyRes = await request(app)
        .post(`${API_BASE}/merkle/verify`)
        .send({ userId, balance: 999999, proof });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.isValid).toBe(false);
    });
  });
});
