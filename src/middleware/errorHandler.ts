import { Request, Response, NextFunction } from 'express';

// Custom error class for API-specific errors
export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

// Handles all errors in the API
// Returns appropriate error responses based on error type
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(`Error: ${err.message}`);

  // Handle our custom API errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: err.message,
      status: err.statusCode
    });
    return;
  }

  // Something unexpected happened - don't leak internal details in production
  res.status(500).json({
    error: 'An unexpected error occurred',
    status: 500,
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}