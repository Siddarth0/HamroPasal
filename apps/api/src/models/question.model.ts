import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion extends Document {
  productId: mongoose.Types.ObjectId;
  storeId: string; // denormalized so the seller can find questions for their store
  userId: string; // asker (Postgres user id)
  question: string;
  answer?: string;
  answeredBy?: string; // userId of the answerer (store owner or admin)
  answeredAt?: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    storeId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    question: { type: String, required: true, trim: true },
    answer: { type: String },
    answeredBy: { type: String },
    answeredAt: { type: Date },
  },
  { timestamps: true }
);

questionSchema.index({ productId: 1, createdAt: -1 });

export const Question = mongoose.model<IQuestion>("Question", questionSchema);
