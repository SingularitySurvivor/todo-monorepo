import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils';
import { User } from '../models';
import { AuthTokenPayload } from '../types';
import { config } from '../config';

export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Middleware to authenticate users
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // For SSE routes, also check query parameter (EventSource can't send custom headers)
    if (!token && req.query.token) {
      token = req.query.token as string;
    }

    // Check if token exists
    if (!token) {
      return next(ApiError.unauthorized('Not authorized, no token'));
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as AuthTokenPayload;

      // Attach decoded token data to request
      req.user = decoded;

      next();
    } catch (error) {
      return next(ApiError.unauthorized('Not authorized, token failed'));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user is admin
 */
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return next(ApiError.forbidden('Not authorized as an admin'));
  }
};