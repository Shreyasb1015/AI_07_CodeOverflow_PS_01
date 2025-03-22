import express from "express";
import {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
} from "../controllers/complaint_controller.js";

const router = express.Router();


router.post("/", createComplaint);

router.get("/", getAllComplaints);

router.get("/:id", getComplaintById);

router.get("/:id/status", updateComplaintStatus);

export default router;
