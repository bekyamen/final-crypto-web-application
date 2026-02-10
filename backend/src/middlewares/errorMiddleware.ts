import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, createErrorResponse } from '../utils/errors';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  error: Error | AppError | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[Error]:', error);

  // Handle validation errors from Zod
  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    res.status(400).json({
      success: false,
      message: 'Validation error',
      errorCode: 'VALIDATION_ERROR',
      errors: formattedErrors,
    });
    return;
  }

  // Handle custom AppError instances
  if (error instanceof AppError) {
    res.status(error.statusCode).json(createErrorResponse(error));
    return;
  }

  // Handle unexpected errors
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    errorCode: 'INTERNAL_ERROR',
  });
};

/**
 * Async handler to wrap async route handlers and pass errors to errorHandler
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
