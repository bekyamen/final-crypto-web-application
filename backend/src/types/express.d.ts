import { Request as ExpressRequest } from 'express';

declare global {
  namespace Express {
    export interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

// Remove the AuthRequest interface or keep it as a convenience type
export type AuthRequest = Express.Request & {
  user: {
    id: string;
    email: string;
    role: string;
  };
};