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
      const { page = 1, limit = 10, sortBy = "created_at", order = "DESC", service_type } = req.query;
      const maintenancesResult = await maintenanceModel.findByVehicleId(
        vehicleId,
        {
          page: page ? parseInt(page) : 1,
          limit: limit ? parseInt(limit) : 10,
          sortBy,
          order,
          service_type,
        }
      );
      res.status(200).json(maintenancesResult);
    } catch (error) {
      next(error);
    }
  },

  async getMaintenanceById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      await checkMaintenanceOwnership(id, userId);
      const maintenance = await maintenanceModel.findById(id);
      res.status(200).json(maintenance);
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