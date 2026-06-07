import mongoose, { Schema, Document } from "mongoose";

export interface IWishlist extends Document {
  userId: string;
  products: mongoose.Types.ObjectId[];
}

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

export const Wishlist = mongoose.model<IWishlist>("Wishlist", wishlistSchema);
