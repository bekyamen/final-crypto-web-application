import { Request, Response, NextFunction } from 'express';

/**
 * Wrap async route handlers and forward errors to the error handler.
 * Generic <Req> allows extended Request types (like AuthRequest) or params.
 */
export const asyncHandler =
  <Req extends Request = Request>(
    fn: (req: Req, res: Response, next: NextFunction) => Promise<any>
  ) =>
  (req: Req, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
