const maintenanceModel = require("../models/maintenanceModel");
const vehicleModel = require("../models/vehicleModel");

const checkMaintenanceOwnership = async (maintenanceId, userId) => {
  const maintenance = await maintenanceModel.findById(maintenanceId);
  if (!maintenance) {
    const error = new Error("Maintenance record not found.");
    error.statusCode = 404;
    throw error;
  }
  const vehicle = await vehicleModel.findById(maintenance.vehicle_id);
  if (!vehicle || vehicle.user_id !== userId) {
    const error = new Error(
      "Forbidden: You do not have permission for this record."
    );
    error.statusCode = 403;
    throw error;
  }
};

const maintenanceController = {
  async addMaintenance(req, res, next) {
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
      const newMaintenance = await maintenanceModel.create(req.body, vehicleId);
      res.status(201).json({
        message: "Maintenance added successfully!",
        maintenance: newMaintenance,
      });
    } catch (error) {
      next(error);
    }
  },

  async getVehicleMaintenances(req, res, next) {
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
      const maintenances = await maintenanceModel.findByVehicleId(vehicleId);
      res.status(200).json(maintenances);
    } catch (error) {
      next(error);
    }
  },

  async updateMaintenance(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      await checkMaintenanceOwnership(id, userId);
      await maintenanceModel.update(id, req.body);
      const updatedMaintenance = await maintenanceModel.findById(id);
      res.status(200).json({
        message: "Maintenance updated successfully!",
        maintenance: updatedMaintenance,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteMaintenance(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      await checkMaintenanceOwnership(id, userId);
      await maintenanceModel.delete(id);
      res.status(200).json({ message: "Maintenance deleted successfully." });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = maintenanceController;