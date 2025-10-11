const vehicleModel = require("../models/vehicleModel");

const checkVehicleOwnership = async (vehicleId, userId) => {
  const vehicle = await vehicleModel.findById(vehicleId);
  if (!vehicle) {
    const error = new Error("Vehicle not found.");
    error.statusCode = 404;
    throw error;
  }
  if (vehicle.user_id !== userId) {
    const error = new Error("Forbidden: You do not own this vehicle.");
    error.statusCode = 403;
    throw error;
  }
  return vehicle;
};

const vehicleController = {
  async createVehicle(req, res, next) {
    try {
      const userId = req.user.userId;
      const newVehicle = await vehicleModel.create(req.body, userId);
      res.status(201).json({
        message: "Vehicle created successfully!",
        vehicle: newVehicle,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyVehicles(req, res, next) {
    try {
      const userId = req.user.userId;
      const vehicles = await vehicleModel.findByUserId(userId);
      res.status(200).json(vehicles);
    } catch (error) {
      next(error);
    }
  },

  async updateVehicle(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      await checkVehicleOwnership(id, userId);
      const affectedRows = await vehicleModel.update(id, req.body);
      if (affectedRows === 0) {
        const error = new Error("Vehicle not found.");
        error.statusCode = 404;
        throw error;
      }
      const updatedVehicle = await vehicleModel.findById(id);
      res.status(200).json({
        message: "Vehicle updated successfully!",
        vehicle: updatedVehicle,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteVehicle(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      await checkVehicleOwnership(id, userId);
      const affectedRows = await vehicleModel.delete(id);
      if (affectedRows === 0) {
        const error = new Error("Vehicle not found.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "Vehicle deleted successfully." });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = vehicleController;