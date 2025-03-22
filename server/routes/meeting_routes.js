import express from "express";
import {
  sendMeetRequest,
  acceptMeet,
  cancelMeet,
} from "../controllers/meeting_controller.js";
import { MEET_ROUTES } from "../utils/endpoints.js";
import { verifyJWT } from "../middleware/auth_middleware.js";

const router = express.Router();

router.post(MEET_ROUTES.REQUEST, verifyJWT, sendMeetRequest);
router.get(MEET_ROUTES.ACCEPT, verifyJWT, acceptMeet);
router.delete(MEET_ROUTES.CANCEL, verifyJWT, cancelMeet);

export default router;
