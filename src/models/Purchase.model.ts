import mongoose, { Document, Schema } from 'mongoose';

export interface IPurchase extends Document {
  user: mongoose.Schema.Types.ObjectId;
  product: mongoose.Schema.Types.ObjectId;
}

const PurchaseSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
}, { timestamps: true });

export default mongoose.model<IPurchase>('Purchase', PurchaseSchema);