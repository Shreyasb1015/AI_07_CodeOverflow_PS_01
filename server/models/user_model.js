import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    otpToVerify: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profilePic: {
      type: String,
      default: "https://example.com/default-avatar.png",
    },
    role: {
      type: String,
      enum: ["Employee", "Administrator", "SupportTeam"],
      required: true,
    },
    department: {
    type: "String",
    enum: [
      "Sales & Marketing",
      "Operations & Planning",
      "Procurement & Vendor Management",
      "Inventory & Warehouse Management",
      "Manufacturing & Production",
      "Quality Assurance",
      "Dispatch & Logistics",
      "HR & Admin",
      "Accounts & Finance",
      "IT & Development"
    ],
    required: true
  },
    notifications: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Notification",
      default: [],
    },
    bio: {
      type: String,
      maxlength: 150,
      default: "",
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
