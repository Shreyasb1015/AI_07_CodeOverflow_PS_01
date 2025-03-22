import { User } from "../models/user_model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const sendFollowRequest = asyncHandler(async (req, res) => {
  const { targetUserId } = req.body;
  if (!targetUserId) {
    return res.status(400).json({ message: "Target user ID is required" });
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    return res.status(404).json({ message: "Target user not found" });
  }

  if (targetUser.followers.includes(req.user._id)) {
    return res.status(400).json({ message: "Already following this user" });
  }

  if (req.user.following.includes(targetUserId)) {
    return res.status(400).json({ message: "Follow request already sent" });
  }

  req.user.following.push(targetUserId);
  await req.user.save();

  res.status(200).json({ message: "Follow request sent" });
});

export const acceptFollowRequest = asyncHandler(async (req, res) => {
  const { targetUserId } = req.body;
  if (!targetUserId) {
    return res.status(400).json({ message: "Target user ID is required" });
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    return res.status(404).json({ message: "Target user not found" });
  }

  if (!req.user.following.includes(targetUserId)) {
    return res
      .status(400)
      .json({ message: "No follow request from this user" });
  }

  req.user.following = req.user.following.filter((id) => id !== targetUserId);
  req.user.followers.push(targetUserId);
  targetUser.followers.push(req.user._id);
  targetUser.following.push(req.user._id);

  await req.user.save();
  await targetUser.save();

  res.status(200).json({ message: "Follow request accepted" });
});

export const rejectFollowRequest = asyncHandler(async (req, res) => {
  const { targetUserId } = req.body;
  if (!targetUserId) {
    return res.status(400).json({ message: "Target user ID is required" });
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    return res.status(404).json({ message: "Target user not found" });
  }

  if (!req.user.following.includes(targetUserId)) {
    return res
      .status(400)
      .json({ message: "No follow request from this user" });
  }

  req.user.following = req.user.following.filter((id) => id !== targetUserId);
  await req.user.save();

  res.status(200).json({ message: "Follow request rejected" });
});
