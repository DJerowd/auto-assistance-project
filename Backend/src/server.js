require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const imageRoutes = require("./routes/imageRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/public", express.static(path.join(__dirname, "..", "public")));

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/maintenances", maintenanceRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});