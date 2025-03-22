import mongoose from "mongoose";

const aiAvatarSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    personality: {
      traits: {
        type: [String], // Example: ["friendly", "witty", "helpful"]
        default: [],
      },
      mood: {
        type: String,
        enum: ["neutral", "happy", "sad", "excited", "calm"],
        default: "neutral",
      },
    },
    abilities: {
      languageUnderstanding: {
        type: Boolean,
        default: true,
      },
      voiceSynthesis: {
        type: Boolean,
        default: false,
      },
      emotionDetection: {
        type: Boolean,
        default: false,
      },
    },
    communication: {
      voice: {
        enabled: {
          type: Boolean,
          default: false,
        },
        accent: {
          type: String,
          enum: ["American", "British", "Indian", "Neutral"],
          default: "Neutral",
        },
      },
      text: {
        enabled: {
          type: Boolean,
          default: true,
        },
        style: {
          type: String,
          enum: ["casual", "formal", "professional"],
          default: "casual",
        },
      },
    },
    knowledge: {
      topics: {
        type: [String], // Example: ["technology", "finance", "health"]
        default: [],
      },
      learningCapability: {
        type: Boolean,
        default: true,
      },
    },
    avatarImage: {
      type: String, // URL to avatar image
      required: true,
    },
    avatarVideo: {
      type: String, // URL to avatar video
      required: true,
    },
  },
  { timestamps: true }
);

export const AIAvatar = mongoose.model("AIAvatar", aiAvatarSchema);;
