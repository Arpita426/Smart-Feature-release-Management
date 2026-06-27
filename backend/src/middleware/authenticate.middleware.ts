import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { UnauthorizedError } from '../errors/UnauthorizedError';

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new UnauthorizedError('Authorization header is missing'));
  }

  if (!authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Invalid authorization format'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);

    req.user = payload;

    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}