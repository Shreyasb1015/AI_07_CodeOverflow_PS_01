import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, 
    },
    isRead: {
      type: Boolean,
      default: false, 
    },
    link: {
      type: String,
      default: "", 
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
