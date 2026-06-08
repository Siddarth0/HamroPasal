import mongoose, { Schema, Document } from "mongoose";

type ChatRole = "CUSTOMER" | "SELLER";

export interface LastMessage {
  text: string;
  senderRole: ChatRole;
  createdAt: Date;
}

export interface IConversation extends Document {
  customerId: string; // user id
  storeId: string;
  sellerId: string; // store owner user id
  lastMessage?: LastMessage;
  customerUnread: number;
  sellerUnread: number;
}

const conversationSchema = new Schema<IConversation>(
  {
    customerId: { type: String, required: true, index: true },
    storeId: { type: String, required: true, index: true },
    sellerId: { type: String, required: true, index: true },
    lastMessage: {
      type: new Schema<LastMessage>(
        {
          text: String,
          senderRole: { type: String, enum: ["CUSTOMER", "SELLER"] },
          createdAt: Date,
        },
        { _id: false },
      ),
      default: undefined,
    },
    customerUnread: { type: Number, default: 0 },
    sellerUnread: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// One thread per customer↔store pair.
conversationSchema.index({ customerId: 1, storeId: 1 }, { unique: true });

export const Conversation = mongoose.model<IConversation>("Conversation", conversationSchema);
