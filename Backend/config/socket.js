import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";

const onlineUsers = new Map(); // userId -> socketId

const initSocket = (server, clientUrl) => {
  const io = new Server(server, {
    cors: { origin: clientUrl || "*", methods: ["GET", "POST"] },
  });

  // Debug: catches connection-level errors (CORS, transport issues, etc.)
  io.engine.on("connection_error", (err) => {
    console.log("🔴 Engine connection error:", err.req?.url, "| code:", err.code, "| message:", err.message, "| context:", err.context);
  });

  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    console.log("🟡 Socket middleware hit, token present:", !!socket.handshake.auth?.token);
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token provided"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (error) {
      console.error("🔴 Socket auth error:", error.message);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);
    console.log(`⚡ User connected: ${socket.user.name} (${socket.id})`);

    socket.broadcast.emit("user_online", { userId });

    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("send_message", async ({ conversationId, receiverId, text, imageUrl }) => {
      try {
        const message = await Message.create({
          conversationId,
          senderId: userId,
          receiverId,
          text: text || "",
          imageUrl: imageUrl || "",
        });

        const populatedMessage = await message.populate("senderId", "name profilePicture");

        io.to(conversationId).emit("receive_message", populatedMessage);

        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("new_message_notification", {
            conversationId,
            senderName: socket.user.name,
            text: text || "📷 Image",
          });
        }

        await Notification.create({
          userId: receiverId,
          type: "message",
          message: `New message from ${socket.user.name}`,
        });
      } catch (error) {
        console.error("🔴 send_message error:", error.message);
        socket.emit("message_error", { message: "Failed to send message" });
      }
    });

    socket.on("typing", ({ conversationId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("user_typing", { conversationId, userId });
      }
    });

    socket.on("stop_typing", ({ conversationId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("user_stop_typing", { conversationId, userId });
      }
    });

    socket.on("mark_read", async ({ conversationId }) => {
      await Message.updateMany(
        { conversationId, receiverId: userId, isRead: false },
        { isRead: true }
      );
      socket.to(conversationId).emit("messages_read", { conversationId, readBy: userId });
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      socket.broadcast.emit("user_offline", { userId });
      console.log(`❌ User disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

export default initSocket;