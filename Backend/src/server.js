require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const cron = require("node-cron");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const imageRoutes = require("./routes/imageRoutes");
const friendshipRoutes = require("./routes/friendshipRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const dataLoaderRoutes = require("./routes/dataLoaderRoutes");
const messageRoutes = require("./routes/messageRoutes");

const errorMiddleware = require("./middlewares/errorMiddleware");
const notificationService = require("./services/notificationService");
const messageModel = require("./models/messageModel");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  }),
);
app.use(express.json());

app.use("/public", express.static(path.join(__dirname, "..", "public")));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/friendships", friendshipRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/maintenances", maintenanceRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/data", dataLoaderRoutes);

app.use(errorMiddleware);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token)
    return next(new Error("Erro de autenticação: Token não fornecido"));
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error("Erro de autenticação: Token inválido"));
    socket.userId = decoded.userId;
    next();
  });
});

io.on("connection", (socket) => {
  const currentUserId = socket.userId;
  if (currentUserId) {
    socket.join(currentUserId.toString());
    console.log(
      `[Socket] Usuário ${currentUserId} conectou e entrou na sala ${currentUserId}`,
    );
  }
  console.log(`Usuário conectado no chat: ${socket.userId}`);
  socket.join(socket.userId.toString());
  socket.on("send_message", async (data, callback) => {
    try {
      const { receiver_id, content, attachment_type, attachment_id } = data;
      const messageId = await messageModel.create({
        sender_id: socket.userId,
        receiver_id,
        content,
        attachment_type,
        attachment_id,
      });
      const savedMessage = await messageModel.findById(messageId);
      io.to(receiver_id.toString()).emit("receive_message", savedMessage);
      io.to(socket.userId.toString()).emit("receive_message", savedMessage);
      if (typeof callback === "function") {
        callback({ status: "success", message: savedMessage });
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem via socket:", error);
      if (typeof callback === "function") {
        callback({ status: "error", error: error.message });
      }
    }
  });
  socket.on("typing", (data) => {
    const { receiver_id, is_typing } = data;
    io.to(receiver_id.toString()).emit("user_typing", {
      sender_id: socket.userId,
      is_typing,
    });
  });
  socket.on("disconnect", () => {
    console.log(`Usuário desconectado: ${socket.userId}`);
  });
});

cron.schedule(
  "0 8 * * *",
  () => {
    console.log("Running daily task to check for reminders...");
    notificationService.checkAndSendReminders();
  },
  {
    timezone: "America/Sao_Paulo",
  },
);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} (HTTP & WebSocket)`);
});
