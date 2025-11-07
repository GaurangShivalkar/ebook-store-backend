// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import User from '../models/User.model';
import mongoose from 'mongoose'; // <-- 1. Import mongoose

// Validation Schema
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  referralCode: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// --- Helper to generate JWT ---
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: '30d',
  });
};

// --- Register Controller ---
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password, referralCode } = registerSchema.parse(req.body);

    // 1. Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Find referrer if code is provided
    // 2a. Fix type of referrerId
    let referrerId: mongoose.Schema.Types.ObjectId | null = null; 
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
       referrerId = referrer._id as mongoose.Schema.Types.ObjectId; // This is now type-safe
      } else {
        console.warn(`Referral code ${referralCode} not found.`);
      }
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

let newReferralCode: string;
let isCodeUnique = false;

do {
  newReferralCode = nanoid(8).toUpperCase();
  const existingUser = await User.findOne({ referralCode: newReferralCode });
  if (!existingUser) {
    isCodeUnique = true;
  }
} while (!isCodeUnique);

    // 5. Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      referralCode: newReferralCode,
      referredBy: referrerId,
    });

    // 6. Return user and token
    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        credits: user.credits,
        referralCode: user.referralCode,
        token: generateToken(user.id), // <-- 3. Use .id (string) instead of ._id
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // 4. Fix Zod error property
      return res.status(400).json(error.issues); 
    }
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- Login Controller ---
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // 1. Find user (and explicitly select password)
    const user = await User.findOne({ email }).select('+password');

    // 2. Check user and password
    if (user && (await bcrypt.compare(password, user.password!))) {
      res.json({
        _id: user._id,
        email: user.email,
        credits: user.credits,
        referralCode: user.referralCode,
        token: generateToken(user.id), // <-- 3. Use .id (string) instead of ._id
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // 4. Fix Zod error property
      return res.status(400).json(error.issues);
    }
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};