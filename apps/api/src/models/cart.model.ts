import mongoose, { Schema, Document } from "mongoose";

interface CartItem {
  productId: mongoose.Types.ObjectId;
  variantId?: string;
  name: string;
  imageUrl?: string;
  price: number;
  quantity: number;
  storeId: string;
}

export interface ICart extends Document {
  userId: string;
  items: CartItem[];
}

const cartItemSchema = new Schema<CartItem>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  variantId: String,
  name: { type: String, required: true },
  imageUrl: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  storeId: { type: String, required: true },
});

const cartSchema = new Schema<ICart>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

export const Cart = mongoose.model<ICart>("Cart", cartSchema);