import { Schema } from "mongoose";

export interface ImageRef {
  url: string;
  publicId: string;
}

// Reusable embedded image: store both the URL and Cloudinary publicId so an
// image can be deleted/replaced. Used by products and categories.
export const imageSchema = new Schema<ImageRef>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);
