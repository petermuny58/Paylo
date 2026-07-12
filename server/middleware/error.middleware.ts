import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';

// Must be registered LAST in app.ts (after all routes). Express recognizes
// it as an error handler because it takes 4 arguments.
export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Invalid request', details: err.issues });
  }

  // Unexpected error — never leak internals (stack traces, SQL, etc.) to the
  // client. Log it server-side so it's still debuggable.
  console.error('UNHANDLED ERROR:', err);
  return res.status(500).json({ error: 'Something went wrong. Please try again.' });
};
