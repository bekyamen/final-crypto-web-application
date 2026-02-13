import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: JwtPayload & { role: string };
}

// Auth middleware
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No token provided',
        errorCode: 'UNAUTHORIZED',
      });
      return; // explicitly return to satisfy TS
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token) as JwtPayload & { role: string };

    req.user = decoded;
    return next(); // explicitly return next()
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      errorCode: 'INVALID_TOKEN',
    });
    return; // explicitly return
  }
};

// Role-based access middleware
export const roleMiddleware = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        errorCode: 'UNAUTHORIZED',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        errorCode: 'FORBIDDEN',
      });
      return;
    }

    return next();
  };
};
