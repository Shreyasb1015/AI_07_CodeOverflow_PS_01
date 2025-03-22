import express from "express";
import {AUTH_ROUTES, USER_ROUTES} from '../utils/endpoints.js'
import {signup,verifyEmail,login,getUser,getUsers,getUserNotifications} from '../controllers/user_controller.js'
import {verifyJWT} from '../middleware/auth_middleware.js'
const router = express.Router()

router.post(AUTH_ROUTES.SIGNUP, signup);
router.post(AUTH_ROUTES.LOGIN, login);
router.get(AUTH_ROUTES.VERIFY_EMAIL,verifyJWT,verifyEmail);
router.get(USER_ROUTES.GET_USER,verifyJWT,getUser)
router.get(USER_ROUTES.GET_USERS,verifyJWT,getUsers)
router.get(USER_ROUTES.GET_NOTIF,verifyJWT,getUserNotifications)

export default router;