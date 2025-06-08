import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { ApiError } from '../utils/ApiError';

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  // Set default status code and error message
  let statusCode = 500;
  let message = 'Internal Server Error';
  let stack: string | undefined;

  // Check if the error is an instance of ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else {
    message = err.message || message;
  }

  // In development, include stack trace
  if (config.server.isDevelopment) {
    stack = err.stack;
  }

  // Log error
  console.error(`[ERROR] ${statusCode} - ${message}`, stack);

  // Send response
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(stack && { stack }),
  });
};