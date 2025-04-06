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
GET /api/merkle/root
```

Returns the Merkle root hash of all user balances.

Example response:
```json
{
  "merkleRoot": "b0e5fb4fb8591fb84ac37360bb29422ccf35dce94b6bb37e1a0534c00d1f4dd8"
}
```

#### Get User Proof

```
GET /api/merkle/proof/:userId
```

Returns the balance and Merkle proof for a specific user.

Example response:
```json
{
  "userId": 1,
  "balance": 100,
  "proof": [
    ["80259d8653be264b4f5cbe4b16f50d2c2d58c99805a46b6be42598804dfbd6a8", "RIGHT"],
    ["a6e5f5992e46ee2435f03700d7968b122e1fdc116f0aef7cfd359e5b106f6113", "RIGHT"],
    ["2be5f4d5be9862e541d599f523a43f4fde42175db6a78a17c288c641ffa94b6b", "RIGHT"]
  ]
}
```

Each proof element is a tuple of [siblingHash, direction], where direction is either "LEFT" or "RIGHT" indicating the position of the sibling hash in the Merkle tree.

#### Verify Proof

```
POST /api/merkle/verify
```

Verifies a Merkle proof for a specific user balance.

Request body:
```json
{
  "userId": 1,
  "balance": 100,
  "proof": [
    ["80259d8653be264b4f5cbe4b16f50d2c2d58c99805a46b6be42598804dfbd6a8", "RIGHT"],
    ["a6e5f5992e46ee2435f03700d7968b122e1fdc116f0aef7cfd359e5b106f6113", "RIGHT"],
    ["2be5f4d5be9862e541d599f523a43f4fde42175db6a78a17c288c641ffa94b6b", "RIGHT"]
  ]
}
```

Example response:
```json
{
  "isValid": true,
  "calculatedRoot": "b0e5fb4fb8591fb84ac37360bb29422ccf35dce94b6bb37e1a0534c00d1f4dd8",
  "providedRoot": null
}
```

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

## Libraries Used

This project utilizes several key libraries, each chosen for specific purposes:

### Core Libraries
- **express** (^4.18.2)
  - Chosen for its robust routing system and middleware support
  - Provides a clean, minimalist web framework for Node.js
  - Widely adopted in the Node.js ecosystem with excellent TypeScript support

- **merkle-tree-lib** (local)
  - Custom library implementing Merkle tree functionality
  - Provides tagged hashing based on BIP-0340 specification
  - Ensures secure and efficient proof generation and verification
  - Implementation Details:
    - Pure TypeScript implementation with no external dependencies
    - Uses native Node.js crypto module for SHA-256 hashing
    - Implements BIP-0340 tagged hashing for enhanced security
    - Provides type-safe API with comprehensive TypeScript definitions

## Future Improvements

Several areas could be enhanced in future versions:

### Security Enhancements
- Implement rate limiting for API endpoints
- Add API key authentication
- Add request validation middleware
- Implement CORS policies

### Performance Optimizations
- Add caching layer for frequently accessed proofs
- Implement batch proof generation
- Optimize Merkle tree construction for large datasets
- Add database integration for persistent storage
- Implement worker threads for parallel proof generation
  - Utilize Node.js worker_threads for CPU-intensive tasks
  - Parallelize Merkle tree construction and proof generation
  - Implement thread pool for managing worker resources
  - Add load balancing across worker threads

### Feature Additions
- Add support for multiple asset types
- Implement real-time balance updates
- Add historical proof verification
- Create a web interface for proof verification
- Add support for batch proof verification
- Implement proof compression for large trees


### Monitoring and Maintenance
- Add logging system
- Implement health check endpoints
- Add metrics collection
- Create monitoring dashboard

## License

MIT