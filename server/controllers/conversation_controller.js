import { asyncHandler } from "../utils/asyncHandler.js";
import { Conversation } from "../models/conversation_model.js";
import { Message } from "../models/message_model.js";
import { ApiError } from "../utils/ApiError.js";

export const createConversation = asyncHandler(async (req, res) => {
  const { participants, isGroup, groupName, groupAdmin } = req.body;

  try {
    const newConversation = await Conversation.create({
      participants,
      isGroup,
      groupName,
      groupAdmin,
    });

    res.status(201).json({
      message: "Conversation created successfully",
      data: newConversation,
    });
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, content, sender } = req.body;

  try {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new ApiError(404, "Conversation not found");
    }

    if (!conversation.participants.includes(sender)) {
      throw new ApiError(
        403,
        "Sender is not a participant in this conversation"
      );
    }

    const newMessage = await Message.create({
      conversationId,
      content,
      sender,
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      latestMessage: newMessage._id,
    });

    res.status(201).json({ message: "Message sent", data: newMessage });
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});



export const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  try {
    const messages = await Message.find({ conversationId }).sort({
      createdAt: 1,
    });

    res
      .status(200)
      .json({ message: "Messages fetched successfully", data: messages });
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

export const getConversationByUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "name email") 
      .populate("latestMessage") 
      .sort({ updatedAt: -1 });

    if (!conversations.length) {
      throw new ApiError(404, "No conversations found for this user");
    }

    res.status(200).json({
      message: "Conversations fetched successfully",
      conversations,
    });
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});
