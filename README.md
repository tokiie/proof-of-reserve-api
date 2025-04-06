# Proof of Reserve System

A system for cryptocurrency exchanges to cryptographically prove their reserves without revealing sensitive customer data. This implementation uses Merkle trees with tagged hashing to ensure data integrity and privacy.

## Overview

Proof of Reserve is a transparency mechanism that allows cryptocurrency exchanges to prove they hold sufficient assets to cover their customer liabilities. This system:

1. Creates a cryptographic proof (Merkle tree) of all user balances
2. Enables individual users to verify their balance is included in the total reserves
3. Maintains privacy by not disclosing individual customer details
4. Uses secure cryptographic methods based on BIP-0340 tagged hashing

## Features

- RESTful API for accessing Merkle root and proofs
- Secure tagged hashing for leaves and branches
- Efficient Merkle proof generation
- User balance verification
- TypeScript implementation with full type safety

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/tokiie/proof-of-reserve.git
cd proof-of-reserve
npm install
```

## Usage

### Build and Run

```bash
# Build the project
npm run build

# Start the server
npm start

# Start in development mode with auto-reloading
npm run dev
```

By default, the server runs on port 3000. You can change this by setting the `PORT` environment variable.

### API Endpoints

#### Get Merkle Root

```
GET /merkle-root
```

Returns the Merkle root hash of all user balances.

Example response:
```json
{
  "merkleRoot": "7a828f0df7c0caf97b26a9d5d7bfac5a1ed9e143e9a141d5fda83366eaa3f662"
}
```

#### Get User Proof

```
GET /merkle-proof/:userId
```

Returns the balance and Merkle proof for a specific user.

Example response:
```json
{
  "userId": 2,
  "balance": 5000,
  "proof": [
    ["a1b2c3d4e5f6...", 0],
    ["7890abcdef12...", 1]
  ]
}
```

Each proof element is a tuple of [siblingHash, side], where side is 0 for left siblings and 1 for right siblings.

## Architecture

This project consists of two main components:

1. **merkle-tree-lib**: A TypeScript library for creating and managing Merkle trees with tagged hashing
2. **proof-of-reserve**: The main application with API endpoints for accessing proofs

### Merkle Tree Implementation

The Merkle tree implementation uses BIP-0340 tagged hashing to prevent second preimage attacks:

```
tagged_hash(tag, msg) = SHA256(SHA256(tag) || SHA256(tag) || msg)
```

This provides extra security by domain-separating different hash operations.

## Development

### Testing

Run the test suite to ensure everything is working correctly:

```bash
npm test
```

### Structure

- `src/server.ts` - Main server implementation with API endpoints
- `src/data/users.ts` - Sample user data for demonstration
- `test/` - Test files for API and Merkle tree functionality

## Security Considerations

- The system uses cryptographically secure hash functions (SHA-256)
- Tagged hashing prevents cross-protocol attacks
- The Merkle tree structure preserves privacy while enabling verification

## License

MIT