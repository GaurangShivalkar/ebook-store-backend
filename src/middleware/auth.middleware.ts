import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User, { IUser } from '../models/User.model';

declare global {
  namespace Express {
    interface Request {
      user?: IUser | null; 
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;
  const secret = process.env.JWT_SECRET;  

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Get token from header
      token = req.headers.authorization.split(' ')[1];
  
      // 2. Add an explicit check for the secret *inside* the try block.
      if (!secret) {
        throw new Error('JWT_SECRET is not configured on the server');
      }

      const decoded = jwt.verify(token as string, secret as string) as JwtPayload;

      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
         return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};