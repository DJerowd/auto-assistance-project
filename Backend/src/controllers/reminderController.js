const reminderModel = require("../models/reminderModel");
const vehicleModel = require("../models/vehicleModel");

const checkReminderOwnership = async (reminderId, userId) => {
  const reminder = await reminderModel.findById(reminderId);
  if (!reminder) {
    const error = new Error("Reminder not found.");
    error.statusCode = 404;
    throw error;
  }
  const vehicle = await vehicleModel.findById(reminder.vehicle_id);
  if (!vehicle || vehicle.user_id !== userId) {
    const error = new Error(
      "Forbidden: You do not have permission for this reminder."
    );
    error.statusCode = 403;
    throw error;
  }
};

const reminderController = {
  async addReminder(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const userId = req.user.userId;
      const vehicle = await vehicleModel.findById(vehicleId);
      if (!vehicle || vehicle.user_id !== userId) {
        const error = new Error(
          "Forbidden: Vehicle not found or not owned by user."
        );
        error.statusCode = 403;
        throw error;
      }

      const newReminder = await reminderModel.create(req.body, vehicleId);
      res
        .status(201)
        .json({
          message: "Reminder created successfully!",
          reminder: newReminder,
        });
    } catch (error) {
      next(error);
    }
  },

  async getVehicleReminders(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const userId = req.user.userId;

      const vehicle = await vehicleModel.findById(vehicleId);
      if (!vehicle || vehicle.user_id !== userId) {
        const error = new Error(
          "Forbidden: Vehicle not found or not owned by user."
        );
        error.statusCode = 403;
        throw error;
      }

      const reminders = await reminderModel.findByVehicleId(vehicleId);
      res.status(200).json(reminders);
    } catch (error) {
      next(error);
    }
  },

  async updateReminder(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      await checkReminderOwnership(id, userId);

      await reminderModel.update(id, req.body);
      const updatedReminder = await reminderModel.findById(id);
      res
        .status(200)
        .json({
          message: "Reminder updated successfully!",
          reminder: updatedReminder,
        });
    } catch (error) {
      next(error);
    }
  },

  async deleteReminder(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      await checkReminderOwnership(id, userId);

      await reminderModel.delete(id);
      res.status(200).json({ message: "Reminder deleted successfully." });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = reminderController;