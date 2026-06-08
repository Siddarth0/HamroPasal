import mongoose, { Schema, Document } from "mongoose";

// Product card attached to a chat message (Daraz-style "chat about this product").
interface ProductRef {
  productId: string;
  name: string;
  slug: string;
  image?: string;
  price: number;
}

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: string;
  senderRole: "CUSTOMER" | "SELLER";
  text: string;
  product?: ProductRef;
  isRead: boolean;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    senderId: { type: String, required: true },
    senderRole: { type: String, enum: ["CUSTOMER", "SELLER"], required: true },
    text: { type: String, required: true },
    product: {
      type: new Schema<ProductRef>(
        {
          productId: { type: String, required: true },
          name: { type: String, required: true },
          slug: { type: String, required: true },
          image: String,
          price: { type: Number, required: true },
        },
        { _id: false },
      ),
      default: undefined,
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

messageSchema.index({ conversationId: 1, createdAt: -1 });

export const Message = mongoose.model<IMessage>("Message", messageSchema);
