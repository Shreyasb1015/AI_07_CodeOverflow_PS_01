import express from "express";
import {CHAT_ROUTES} from '../utils/endpoints.js'
import {createConversation,sendMessage,getMessages,getConversationByUser} from '../controllers/conversation_controller.js'
import {verifyJWT} from '../middleware/auth_middleware.js'
const router = express.Router()

router.post(CHAT_ROUTES.CREATE,verifyJWT,createConversation);
router.post(CHAT_ROUTES.SEND,verifyJWT,sendMessage)
router.get(CHAT_ROUTES.GET,verifyJWT,getMessages)
router.get(CHAT_ROUTES.GET_CONVO,verifyJWT,getConversationByUser)

export default router
