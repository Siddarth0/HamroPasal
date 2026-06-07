import mongoose, { Schema, Document } from "mongoose";
import { imageSchema, type ImageRef } from "./image.schema";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: ImageRef;
  parentId?: mongoose.Types.ObjectId | null;
  isActive: boolean;
  sortOrder: number;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: String,
    image: { type: imageSchema, default: undefined },
    parentId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// slug already has a unique index via the field definition.
categorySchema.index({ parentId: 1 });

export const Category = mongoose.model<ICategory>("Category", categorySchema);