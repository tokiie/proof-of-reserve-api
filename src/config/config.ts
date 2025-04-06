/**
 * Main configuration object for the application
 */
export const config = {
  /**
   * Server settings - port and API base path
   */
  server: {
    port: process.env.PORT || 3000,
    apiBase: '/api'
  },

  /**
   * Merkle tree specific settings
   * These tags are used to prevent hash collisions
   */
  merkleTree: {
    leafTag: 'ProofOfReserve_Leaf',
    branchTag: 'ProofOfReserve_Branch'
  },

  /**
   * Environment detection
   */
  env: {
    isDevelopment: process.env.NODE_ENV === 'development' || !process.env.NODE_ENV,
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test'
  },

  /**
   * Logging configuration
   */
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};