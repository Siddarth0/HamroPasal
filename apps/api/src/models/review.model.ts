import mongoose, { Schema, Document } from "mongoose";
import { imageSchema, type ImageRef } from "./image.schema";

export interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  userId: string; // Postgres user id
  storeId: string; // denormalized for store-level rating queries
  subOrderId?: string; // sub-order the purchase came from (verified purchase)
  rating: number; // 1-5
  title?: string;
  comment: string;
  images: ImageRef[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
}

const reviewSchema = new Schema<IReview>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    userId: { type: String, required: true, index: true },
    storeId: { type: String, required: true, index: true },
    subOrderId: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: String,
    comment: { type: String, required: true },
    images: { type: [imageSchema], default: [] },
    isVerifiedPurchase: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// One review per user per product.
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export const Review = mongoose.model<IReview>("Review", reviewSchema);
