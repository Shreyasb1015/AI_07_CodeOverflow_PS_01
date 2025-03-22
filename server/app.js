import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "node:http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { API_ROUTES } from "./utils/endpoints.js";

import { EventEmitter } from "events";
EventEmitter.defaultMaxListeners = 20;

import userRouter from "./routes/user_routes.js";
import socialRouter from "./routes/social_routes.js";
import conversationRouter from "./routes/conversation_routes.js";
import meetingRouter from "./routes/meeting_routes.js"
import avatarRouter from "./routes/ai_avatar_routes.js"
import complaintRouter from "./routes/complaint_routes.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.use(morgan("dev"));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
const server = createServer(app);

app.use(API_ROUTES.USER, userRouter);
app.use(API_ROUTES.SOCIAL, socialRouter);
app.use(API_ROUTES.CHAT, conversationRouter);
app.use(API_ROUTES.MEETING, meetingRouter);
app.use(API_ROUTES.AVATAR,avatarRouter);
app.use(API_ROUTES.COMPLAINT,complaintRouter)

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected with socket id: ", socket.id);

  socket.on("join-conversation", (data) => {
    const { conversationId, username } = data;
    if (!conversationId) return;
    socket.join(conversationId);
    console.log(`User joined conversation with id: ${conversationId}`);
  });

  socket.on("leave-conversation", (data) => {
    const { conversationId, username } = data;
    if (!conversationId) return;
    socket.leave(conversationId);
    io.to(conversationId).emit("userLeft", {
      username,
      message: `${username} has left the chat.`,
    });
    console.log(`User ${socket.id} left conversation ${conversationId}`);
  });

  socket.on("sendMessage", (data) => {
    const { conversationId, content, sender } = data;
    if (!conversationId || !content || !sender) {
      console.error("Incomplete data for sending message.");
      return;
    }
    io.to(conversationId).emit("message", { conversationId, content, sender });
  });

  socket.on("activity", (data) => {
    const { username, conversationId } = data;
    if (!conversationId || !username) return;
    console.log(`${username} is typing...`);
    socket.broadcast.to(conversationId).emit("activity", username);
  });

  socket.on("disconnect", () => {
    socket.removeAllListeners();
    console.log("User disconnected ", socket.id);
  });
});

export default server;
