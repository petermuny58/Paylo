import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';

interface JwtPayload {
  id: string;
  phoneNumber: string;
}

// Augment Express's Request type so `req.user` is typed everywhere
// downstream (controllers, other middleware) without needing `as` casts.
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Verifies the Bearer token issued by POST /auth/login (Part 2, next turn)
// and attaches the decoded payload to req.user. Every wallet route sits
// behind this — see wallet.routes.ts.
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Missing or malformed authorization header', 401));
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    next(new AppError('Invalid or expired session. Please log in again.', 401));
  }
};
