export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public errorCode: string = 'INTERNAL_ERROR',
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, errorCode: string = 'VALIDATION_ERROR') {
    super(message, 400, errorCode);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', errorCode: string = 'UNAUTHORIZED') {
    super(message, 401, errorCode);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', errorCode: string = 'FORBIDDEN') {
    super(message, 403, errorCode);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, errorCode: string = 'NOT_FOUND') {
    super(`${resource} not found`, 404, errorCode);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, errorCode: string = 'CONFLICT') {
    super(message, 409, errorCode);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', errorCode: string = 'INTERNAL_ERROR') {
    super(message, 500, errorCode);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

export const createSuccessResponse = <T>(
  data: T,
  message: string = 'Success',
) => ({
  success: true,
  message,
  data,
});

export const createErrorResponse = (
  error: AppError | Error,
  statusCode?: number,
) => {
  if (error instanceof AppError) {
    return {
      success: false,
      message: error.message,
      errorCode: error.errorCode,
      statusCode: error.statusCode,
    };
  }

  return {
    success: false,
    message: error.message || 'An unexpected error occurred',
    errorCode: 'UNKNOWN_ERROR',
    statusCode: statusCode || 500,
  };
};
