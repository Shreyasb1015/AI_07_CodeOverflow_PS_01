import { asyncHandler } from "../utils/asyncHandler.js";
import { AIAvatar } from "../models/ai_avatar_model.js";
import { ApiError } from "../utils/ApiError.js";

// Get all avatars
export const getAvatars = asyncHandler(async (req, res) => {
  try {
    const avatars = await AIAvatar.find(); // Fetch all avatars
    res.status(200).json({
      success: true,
      message: "Avatars fetched successfully",
      avatars,
    });
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

// Get a single avatar by ID
export const getAvatar = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params; // Extract ID from request params
    const avatar = await AIAvatar.findById(id);

    if (!avatar) {
      throw new ApiError(404, "Avatar not found");
    }

    res.status(200).json({
      success: true,
      message: "Avatar fetched successfully",
      avatar,
    });
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});
