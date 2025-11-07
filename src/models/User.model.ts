import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string; // Optional because we remove it on sends
  referralCode: string;
  credits: number;
  referredBy: mongoose.Schema.Types.ObjectId | null;
  hasMadeFirstPurchase: boolean;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false }, // 'select: false' hides it by default
  referralCode: { type: String, required: true, unique: true },
  credits: { type: Number, default: 0 },
  // This is the key relationship!
  referredBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  hasMadeFirstPurchase: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);