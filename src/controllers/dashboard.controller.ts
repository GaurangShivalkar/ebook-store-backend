// src/controllers/dashboard.controller.ts
import { Request, Response } from 'express';
import User from '../models/User.model';

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;

    // 1. Get the current user's basic info
    const user = await User.findById(userId).select('referralCode credits');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 2. Find all users who were referred by this user
    const referredUsers = await User.find({ referredBy: userId }).select('hasMadeFirstPurchase');

    // 3. Calculate metrics
    const totalReferredUsers = referredUsers.length;

    const convertedUsers = referredUsers.filter(u => u.hasMadeFirstPurchase).length;

    // "Total Credits Earned" from referrals
    const totalCreditsEarned = convertedUsers * 2; 

    // 4. Construct the referral link
    // In a real app, you'd get the base URL from env vars
    const referralLink = `https://yourapp.com/register?r=${user.referralCode}`;

    res.json({
      referralLink: referralLink,
      totalReferredUsers: totalReferredUsers,
      convertedUsers: convertedUsers,
      totalCreditsEarned: totalCreditsEarned,
      currentCreditBalance: user.credits, // Good to show this too
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};