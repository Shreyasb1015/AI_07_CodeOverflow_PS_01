import express from "express";
import {
  sendFollowRequest,
  acceptFollowRequest,
  rejectFollowRequest,
} from "../controllers/social_controller.js";
import { SOCIAL_ROUTES } from "../utils/endpoints.js";
import { verifyJWT } from "../middleware/auth_middleware.js";

const router = express.Router();

router.post(SOCIAL_ROUTES.SEND_REQUEST,verifyJWT, sendFollowRequest);
router.post(SOCIAL_ROUTES.ACCEPT_REQUEST,verifyJWT, acceptFollowRequest);
router.post(SOCIAL_ROUTES.REJECT_REQUEST,verifyJWT, rejectFollowRequest);

export default router;
