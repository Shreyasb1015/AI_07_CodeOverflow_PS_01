import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    isGroup: { type: Boolean, default: false }, 
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    groupName: { type: String },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" }, 
  },
  { timestamps: true }
);

export const Conversation = mongoose.model("Conversation", conversationSchema);
