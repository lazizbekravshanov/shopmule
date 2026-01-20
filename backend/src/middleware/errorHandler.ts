import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  // Basic error handler for now; extend with structured errors later.
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
}

