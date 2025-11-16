require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const cron = require("node-cron");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const imageRoutes = require("./routes/imageRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const dataLoaderRoutes = require('./routes/dataLoaderRoutes');
const errorMiddleware = require("./middlewares/errorMiddleware");
const notificationService = require("./services/notificationService");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/public", express.static(path.join(__dirname, "..", "public")));

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/maintenances", maintenanceRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/data', dataLoaderRoutes);

app.use(errorMiddleware);

cron.schedule(
  "0 8 * * *",
  () => {
    console.log("Running daily task to check for reminders...");
    notificationService.checkAndSendReminders();
  },
  {
    timezone: "America/Sao_Paulo",
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});