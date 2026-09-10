export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function createError(message, statusCode, code) {
  return new AppError(message, statusCode, code);
}

export const Errors = {
  NOT_FOUND: (resource = 'Resource') => new AppError(`${resource} not found`, 404, 'NOT_FOUND'),
  UNAUTHORIZED: () => new AppError('Authentication required', 401, 'UNAUTHORIZED'),
  FORBIDDEN: () => new AppError('Insufficient permissions', 403, 'FORBIDDEN'),
  VALIDATION: (msg) => new AppError(msg || 'Validation failed', 400, 'VALIDATION_ERROR'),
  CONFLICT: (msg) => new AppError(msg || 'Resource already exists', 409, 'CONFLICT'),
  INTERNAL: (msg) => new AppError(msg || 'Internal server error', 500, 'INTERNAL_ERROR'),
};
