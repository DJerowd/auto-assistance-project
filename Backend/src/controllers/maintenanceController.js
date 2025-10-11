const maintenanceModel = require("../models/maintenanceModel");
const vehicleModel = require("../models/vehicleModel");

const maintenanceController = {
  async addMaintenance(req, res) {
    try {
      const { vehicleId } = req.params;
      const userId = req.user.userId;
      const vehicle = await vehicleModel.findById(vehicleId);
      if (!vehicle || vehicle.user_id !== userId) {
        return res
          .status(403)
          .json({
            message: "Forbidden: Vehicle not found or not owned by user.",
          });
      }
      const newMaintenance = await maintenanceModel.create(req.body, vehicleId);
      res
        .status(201)
        .json({
          message: "Maintenance added successfully!",
          maintenance: newMaintenance,
        });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error adding maintenance.", error: error.message });
    }
  },

  async getVehicleMaintenances(req, res) {
    try {
      const { vehicleId } = req.params;
      const userId = req.user.userId;
      const vehicle = await vehicleModel.findById(vehicleId);
      if (!vehicle || vehicle.user_id !== userId) {
        return res
          .status(403)
          .json({
            message: "Forbidden: Vehicle not found or not owned by user.",
          });
      }
      const maintenances = await maintenanceModel.findByVehicleId(vehicleId);
      res.status(200).json(maintenances);
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error fetching maintenances.",
          error: error.message,
        });
    }
  },

  async updateMaintenance(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const maintenance = await maintenanceModel.findById(id);
      if (!maintenance) {
        return res
          .status(404)
          .json({ message: "Maintenance record not found." });
      }
      const vehicle = await vehicleModel.findById(maintenance.vehicle_id);
      if (!vehicle || vehicle.user_id !== userId) {
        return res
          .status(403)
          .json({
            message:
              "Forbidden: You do not have permission to edit this record.",
          });
      }
      await maintenanceModel.update(id, req.body);
      const updatedMaintenance = await maintenanceModel.findById(id);
      res
        .status(200)
        .json({
          message: "Maintenance updated successfully!",
          maintenance: updatedMaintenance,
        });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating maintenance.", error: error.message });
    }
  },

  async deleteMaintenance(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const maintenance = await maintenanceModel.findById(id);
      if (!maintenance) {
        return res
          .status(404)
          .json({ message: "Maintenance record not found." });
      }
      const vehicle = await vehicleModel.findById(maintenance.vehicle_id);
      if (!vehicle || vehicle.user_id !== userId) {
        return res
          .status(403)
          .json({
            message:
              "Forbidden: You do not have permission to delete this record.",
          });
      }
      await maintenanceModel.delete(id);
      res.status(200).json({ message: "Maintenance deleted successfully." });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error deleting maintenance.", error: error.message });
    }
  },
};

module.exports = maintenanceController;