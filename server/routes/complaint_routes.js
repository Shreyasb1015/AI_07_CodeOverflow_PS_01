import express from "express";
import {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
} from "../controllers/complaint_controller.js";
import {verifyJWT} from "../middleware/auth_middleware.js"

const router = express.Router();


router.post("/", verifyJWT,createComplaint);

router.get("/", verifyJWT,getAllComplaints);

router.get("/:id",verifyJWT, getComplaintById);

router.get("/:id/:status", verifyJWT,updateComplaintStatus);

export default router;
