// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User, { IUser } from '../models/User.model'; // Import IUser

// Add a custom property 'user' to the Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: IUser | null; // Use the IUser interface
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
      // This is the fix. Now 'secret' is guaranteed to be a 'string'
      // for the 'jwt.verify' call on the next line.
      if (!secret) {
        throw new Error('JWT_SECRET is not configured on the server');
      }

      // 3. Verify token
      const decoded = jwt.verify(token, secret) as JwtPayload;

      // 4. Get user from the token (id is on the payload)
      req.user = await User.findById(decoded.id).select('-password');
      
      // 5. Handle case where user might not exist
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