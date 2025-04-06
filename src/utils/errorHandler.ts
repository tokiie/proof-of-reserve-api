import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

/**
 * Error handler middleware for Express
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(`Error: ${err.message}`);

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: err.message
    });
    return;
  }

  res.status(500).json({
    error: 'Internal server error'
  });
}

/**
 * Async handler to catch errors in async Express route handlers
 *
 * @param fn - Async function to wrap
 * @returns Express middleware function
 */
export const asyncHandler = (fn: Function) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};