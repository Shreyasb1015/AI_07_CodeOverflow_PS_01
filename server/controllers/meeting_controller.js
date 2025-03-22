import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user_model.js";
import { Notification } from "../models/notification_model.js";
import { Meeting } from "../models/meeting_model.js";

export const sendMeetRequest = asyncHandler(async (req, res) => {
  const { expertId, time } = req.body;
  const userId = req.user._id;

  try {
    const expert = await User.findById(expertId);
    if (!expert || expert.role !== "Expert") {
      throw new ApiError(404, "Expert not found");
    }

    if (!time || new Date(time) < new Date()) {
      throw new ApiError(
        400,
        "Invalid meeting time. It must be in the future."
      );
    }

    const meeting = await Meeting.create({
      user: userId,
      expert: expertId,
      preferredTime: time, // User's preferred time
      scheduledTime: null, // Initially null, expert will decide later
      status: "scheduled",
    });

    try {
      const notification = await Notification.create({
        content: "New meeting request received",
        recipient: expertId,
        sender: userId,
      });

      if (notification) {
        expert.notifications.push(notification._id);
        await expert.save();
      }
    } catch (notifError) {
      console.error("Notification creation failed:", notifError.message);
    }

    res.status(201).json({
      success: true,
      message: "Meeting request sent successfully",
      meeting,
    });
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

export const acceptMeet = asyncHandler(async (req, res) => {
  const { meetingId, time } = req.params; // Time comes from params
  const expertId = req.user._id;

  try {
    if (!time || new Date(time) < new Date()) {
      throw new ApiError(
        400,
        "Invalid meeting time. It must be in the future."
      );
    }

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      throw new ApiError(404, "Meeting not found");
    }

    const user = await User.findById(meeting.user);

    if (meeting.expert.toString() !== expertId.toString()) {
      throw new ApiError(403, "You are not authorized to accept this meeting.");
    }

    meeting.status = "accepted";
    meeting.scheduledTime = time; // Expert's finalized time
    await meeting.save();

    try {
      const notification = await Notification.create({
        content: `Your meeting request has been accepted. Scheduled at ${new Date(
          time
        ).toLocaleString()}`,
        recipient: meeting.user,
        sender: expertId,
      });

      if (notification) {
        user.notifications.push(notification._id);
        await user.save();
      }
    } catch (notifError) {
      console.error("Notification creation failed:", notifError.message);
    }

    res.status(200).json({
      success: true,
      message: "Meeting request accepted",
      meeting,
    });
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

export const cancelMeet = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;
  const userId = req.user._id;

  try {
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      throw new ApiError(404, "Meeting not found");
    }

    const user = await User.findById(meeting.user);
    const expert = await User.findById(meeting.expert);

    if (
      meeting.expert.toString() !== userId.toString() && // user or expert. anyone can cancel the meet
      meeting.user.toString() !== userId.toString()
    ) {
      throw new ApiError(403, "You are not authorized to cancel this meeting.");
    }

    meeting.status = "cancelled";
    await meeting.save();

    try {
      const notification = await Notification.create({
        content: "Your meeting request has been cancelled",
        recipient:
          meeting.user.toString() === userId.toString()
            ? meeting.expert
            : meeting.user,
        sender: userId,
      });

      if (notification) {
        if (meeting.user.toString() === userId.toString()) {
          expert.notifications.push(notification._id);
          await expert.save();
        } else {
          user.notifications.push(notification._id);
          await user.save();
        }
      }
    } catch (notifError) {
      console.error("Notification creation failed:", notifError.message);
    }

    res.status(200).json({
      success: true,
      message: "Meeting cancelled successfully",
      meeting,
    });
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});
