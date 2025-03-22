import express from "express";
import {
  getAvatars,getAvatar
} from "../controllers/avatar_controller.js";
import { AVATAR_ROUTES } from "../utils/endpoints.js";
import { verifyJWT } from "../middleware/auth_middleware.js";

const router = express.Router();

router.get(AVATAR_ROUTES.GET_AVATARS, verifyJWT, getAvatars);
router.get(AVATAR_ROUTES.GET_AVATAR, verifyJWT, getAvatar);


export default router;
