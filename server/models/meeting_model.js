import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    preferredTime: {
      type: Date,
      required: true,
    },
    scheduleTime: {
      type: Date
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "accepted","rejected"],
      default: "scheduled",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Meeting = mongoose.model("Meeting", meetingSchema);
