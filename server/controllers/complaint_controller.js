import { Complaint } from "../models/complaint_model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendApologyMail } from "../utils/helpers.js";
import { User } from "../models/user_model.js";


const checkAdmin = (req) => {
  if (!req.user || req.user.role !== "SupportTeam") {
    throw new ApiError(403, "Access denied. Admins only.");
  }
};


export const createComplaint = asyncHandler(async (req, res) => {
  try {
    const { issueType, description } = req.body;

    const userId = req.user._id

    if (!userId || !issueType || !description) {
      throw new ApiError(400, "All fields are required");
    }

    const { name,email } = await User.findById(userId);

    const complaint = await Complaint.create({
      userId,
      issueType,
      description,
    });

    await sendApologyMail(name,email,issueType,description)

    res.status(201).json({ success: true, complaint });
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});


export const getAllComplaints = asyncHandler(async (req, res) => {
  try {
    checkAdmin(req); 

    const complaints = await Complaint.find()
      .populate("userId", "name email")
      
    res.status(200).json({ success: true, complaints });
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});


export const getComplaintById = asyncHandler(async (req, res) => {
  try {
    checkAdmin(req); 

    const { id } = req.params;
    const complaint = await Complaint.findById(id)
      .populate("userId", "name email")

    if (!complaint) throw new ApiError(404, "Complaint not found");

    res.status(200).json({ success: true, complaint });
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});


export const updateComplaintStatus = asyncHandler(async (req, res) => {
  try {
    checkAdmin(req); 

    const { id,status} = req.params;
    console.log(id,status);
    
    const validStatuses = ["Pending", "In Progress", "Resolved", "Rejected"];
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, "Invalid status");
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!complaint) throw new ApiError(404, "Complaint not found");

    res.status(200).json({ success: true, complaint });
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});
