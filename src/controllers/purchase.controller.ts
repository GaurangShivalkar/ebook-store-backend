// src/controllers/purchase.controller.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import User from '../models/User.model';
import Product from '../models/Product.model';
import Purchase from '../models/Purchase.model';

const purchaseSchema = z.object({
  productId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid Product ID",
  }),
});

export const simulatePurchase = async (req: Request, res: Response) => {
  // --- NO MORE TRANSACTION ---
  try {
    const { productId } = purchaseSchema.parse(req.body);

    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const userId = req.user._id;

    // 1. Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 2. Check if product exists (good practice)
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // 3. LOG THE PURCHASE EVENT
    await Purchase.create({ user: userId, product: productId });

    // 4. --- THIS IS THE CORE LOGIC ---
    // Check if this is the user's *first* purchase
    if (!user.hasMadeFirstPurchase) {
      
      // A. Mark this as their first purchase
      user.hasMadeFirstPurchase = true;
      
      // B. Give this user (Ryan) 2 credits
      user.credits += 2;
      
      // C. Check if this user was referred by someone (Lina)
      if (user.referredBy) {
        // Find the referrer (Lina) and give them 2 credits
        const referrer = await User.findByIdAndUpdate(
          user.referredBy,
          { $inc: { credits: 2 } }, // $inc is atomic, so this is safe
          { new: true }
        );
        
        if (!referrer) {
          console.warn(`Referrer ${user.referredBy} not found during credit update.`);
        }
      }
      
      // D. Save the changes to this user (Ryan)
      await user.save();
    }
    // --- END OF CORE LOGIC ---

    // 5. If everything is successful, return the new user state
    res.status(201).json({ 
      message: 'Purchase successful',
      credits: user.credits,
      hasMadeFirstPurchase: user.hasMadeFirstPurchase 
    });

  } catch (error) {
    // 6. Handle errors
    if (error instanceof z.ZodError) {
      return res.status(400).json(error.issues);
    }
    console.error('--- PURCHASE FAILED ---', error); // This will log the *real* error
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- Helper to add dummy products (no change) ---
export const setupProducts = async (req: Request, res: Response) => {
    try {
        await Product.deleteMany({});
        await Product.insertMany([
            { name: 'Atomic Habits', price: 499 },
            { name: 'The Subtle Art of Not Giving a F*ck', price: 399 },
            { name: 'Rich Dad Poor Dad', price: 349 },
            { name: 'Deep Work', price: 450 },
            { name: 'The Alchemist', price: 299 },
            { name: 'Can’t Hurt Me', price: 550 },
            { name: 'Sapiens: A Brief History of Humankind', price: 599 },
            { name: 'The Psychology of Money', price: 379 },
            { name: 'Think and Grow Rich', price: 320 },
            { name: 'The 7 Habits of Highly Effective People', price: 520 }
        ]);
        res.status(201).json({ message: 'Dummy products created' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};