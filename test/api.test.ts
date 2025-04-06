import request from 'supertest';
import crypto from 'crypto';
import { app, merkleTree, LEAF_TAG, BRANCH_TAG } from '../src/server';
import { users } from '../src/data/users';

describe('Proof of Reserve API Endpoints', () => {
  it('GET /merkle-root should return the correct Merkle root', async () => {
    const res = await request(app).get('/merkle-root');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('merkleRoot');
    const rootHex = res.body.merkleRoot;
    // Check that it is a 64-character hex string
    expect(rootHex).toMatch(/^[0-9a-f]{64}$/);
    // It should match the MerkleTree's computed root for the current users
    expect(rootHex).toEqual(merkleTree.getHexRoot());
  });

  it('GET /merkle-proof/:userId should return balance and proof for a valid user', async () => {
    const user = users[2];  // user with id = 3 (third in the list)
    const res = await request(app).get(`/merkle-proof/${user.id}`);
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(user.id);
    expect(res.body.balance).toBe(user.balance);
    expect(Array.isArray(res.body.proof)).toBe(true);

    // Verify that the proof hashes to the same root
    const proof = res.body.proof as [string, number][];
    // Compute the leaf hash using the ProofOfReserve_Leaf tag
    const leafData = Buffer.from(`(${user.id},${user.balance})`, 'utf8');
    const tagHashLeaf = crypto.createHash('sha256').update(LEAF_TAG, 'utf8').digest();
    let currentHash = crypto.createHash('sha256')
                            .update(tagHashLeaf).update(tagHashLeaf).update(leafData)
                            .digest();
    // Iterate through proof elements
    for (const [siblingHex, side] of proof) {
      const siblingHash = Buffer.from(siblingHex, 'hex');
      const tagHashBranch = crypto.createHash('sha256').update(BRANCH_TAG, 'utf8').digest();
      if (side === 0) {
        // Sibling is left
        currentHash = crypto.createHash('sha256')
                             .update(tagHashBranch).update(tagHashBranch)
                             .update(Buffer.concat([siblingHash, currentHash]))
                             .digest();
      } else if (side === 1) {
        // Sibling is right
        currentHash = crypto.createHash('sha256')
                             .update(tagHashBranch).update(tagHashBranch)
                             .update(Buffer.concat([currentHash, siblingHash]))
                             .digest();
      } else {
        throw new Error('Invalid side value in proof');
      }
    }
    const calculatedRoot = currentHash.toString('hex');
    // Compare with root from the /merkle-root endpoint or from the tree
    expect(calculatedRoot).toEqual(merkleTree.getHexRoot());
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
