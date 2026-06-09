import mongoose, { Schema, Document } from "mongoose";
import { imageSchema, type ImageRef } from "./image.schema";

interface ProductVariant {
  name: string;
  price: number;
  comparePrice?: number;
  stock: number;
  sku?: string;
  attributes: Map<string, string>;
}

interface ProductAttribute {
  name: string;
  values: string[];
}

export interface IProduct extends Document {
  storeId: string;
  categoryId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  images: ImageRef[];
  price: number;
  comparePrice?: number;
  stock: number;
  sku?: string;
  variants: ProductVariant[];
  attributes: ProductAttribute[];
  tags: string[];
  isActive: boolean;
  storeActive: boolean; // denormalized: store.status === ACTIVE (synced on approve/suspend)
  avgRating: number;
  reviewCount: number;
  soldCount: number;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
}

const variantSchema = new Schema<ProductVariant>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  comparePrice: Number,
  stock: { type: Number, default: 0 },
  sku: String,
  attributes: { type: Map, of: String },
});

const attributeSchema = new Schema<ProductAttribute>({
  name: { type: String, required: true },
  values: [String],
});

const productSchema = new Schema<IProduct>(
  {
    storeId: { type: String, required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    images: { type: [imageSchema], default: [] },
    price: { type: Number, required: true, min: 0 },
    comparePrice: Number,
    stock: { type: Number, default: 0, min: 0 },
    sku: String,
    variants: [variantSchema],
    attributes: [attributeSchema],
    tags: [String],
    isActive: { type: Boolean, default: true },
    storeActive: { type: Boolean, default: true },
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    weight: Number,
    dimensions: { length: Number, width: Number, height: Number },
  },
  { timestamps: true }
);

productSchema.index({ storeId: 1, isActive: 1 });
productSchema.index({ categoryId: 1, isActive: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ name: "text", description: "text", tags: "text" });

export const Product = mongoose.model<IProduct>("Product", productSchema);