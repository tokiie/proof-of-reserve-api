import { MerkleTree, HashStrategyFactory, HashStrategyType, ProofDirection } from 'merkle-tree-lib';
import { User } from '../types/User';
import { users } from '../data/users';

// Handles all Merkle tree operations and proof generation
export class MerkleTreeService {
  private merkleTree: MerkleTree;
  private readonly LEAF_TAG = 'ProofOfReserve_Leaf';
  private readonly BRANCH_TAG = 'ProofOfReserve_Branch';

  /**
   * Creates a new MerkleTreeService
   *
   * @param userList - Optional list of users. If not provided, uses the default list.
   */
  constructor(userList: User[] = users) {
    const leafHashStrategy = HashStrategyFactory.createStrategy(
      HashStrategyType.TAGGED_SHA256,
      { tag: this.LEAF_TAG }
    );

    const branchHashStrategy = HashStrategyFactory.createStrategy(
      HashStrategyType.TAGGED_SHA256,
      { tag: this.BRANCH_TAG }
    );

    const leaves = userList.map(user => this.formatUserData(user));
    this.merkleTree = new MerkleTree(leaves, leafHashStrategy, branchHashStrategy);
  }

  // Converts user data into a format suitable for the Merkle tree
  private formatUserData(user: User): string {
    return `(${user.id},${user.balance})`;
  }

  /**
   * Get the Merkle root as a hex string
   *
   * @returns Hex string representation of the Merkle root
   */
  public getMerkleRoot(): string {
    return this.merkleTree.getRootHex();
  }

  // Generates a proof for a specific user's balance
  // Returns null if the user doesn't exist
  public generateProofForUser(userId: number): { userId: number; balance: number; proof: [string, ProofDirection][] } | null {
    const user = users.find(u => u.id === userId);
    if (!user) {
      return null;
    }

    const index = users.findIndex(u => u.id === userId);
    const proof = this.merkleTree.generateProof(index);

    const proofOutput = proof.getElements().map(item => [
      item.siblingHash.toString('hex'),
      item.direction
    ] as [string, ProofDirection]);

    return {
      userId: user.id,
      balance: user.balance,
      proof: proofOutput
    };
  }

  // Verifies if a given proof is valid for a user's balance
  public verifyProof(userId: number, balance: number, proof: [string, ProofDirection][]): boolean {
    try {
      const hashStrategy = HashStrategyFactory.createStrategy(
        HashStrategyType.TAGGED_SHA256,
        { tag: this.LEAF_TAG }
      );

      const userData = this.formatUserData({ id: userId, balance });
      let currentHash = hashStrategy.hash(userData);

      for (const [siblingHex, direction] of proof) {
        const siblingHash = Buffer.from(siblingHex, 'hex');

        // Combine hashes based on whether the sibling is on the left or right
        const combinedData = direction === ProofDirection.LEFT
          ? Buffer.concat([siblingHash, currentHash])
          : Buffer.concat([currentHash, siblingHash]);

        currentHash = HashStrategyFactory.createStrategy(
          HashStrategyType.TAGGED_SHA256,
          { tag: this.BRANCH_TAG }
        ).hash(combinedData);
      }

      const calculatedRoot = currentHash.toString('hex');
      const treeRoot = this.merkleTree.getRootHex();

      return calculatedRoot === treeRoot;
    } catch (error) {
      console.error('Error verifying proof:', error);
      return false;
    }
  }

  /**
   * Get the Merkle root as a hex string
   */
  get merkleRoot(): string {
    return this.merkleTree.getRootHex();
  }

  /**
   * Get the Merkle tree instance
   */
  get tree(): MerkleTree {
    return this.merkleTree;
  }

  /**
   * Get the leaf tag
   */
  get leafTag(): string {
    return this.LEAF_TAG;
  }

  /**
   * Get the branch tag
   */
  get branchTag(): string {
    return this.BRANCH_TAG;
  }
}