import jwt from 'jsonwebtoken';
import { config } from '../config/environment';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export const generateToken = (payload: JwtPayload): string => {
  // Use type assertion to bypass TypeScript's strict checking
  const options: any = {
    expiresIn: config.jwtExpiration,
    algorithm: 'HS256',
  };
  
  return jwt.sign(payload, config.jwtSecret, options);
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, config.jwtSecret, {
      algorithms: ['HS256'],
    }) as JwtPayload;
  } catch (error: any) {
    if (error?.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }

    if (error?.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }

    throw error;
  }
};

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
};