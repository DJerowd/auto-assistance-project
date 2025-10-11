const vehicleModel = require("../models/vehicleModel");

const vehicleController = {
  async createVehicle(req, res) {
    try {
      const userId = req.user.userId;
      const newVehicle = await vehicleModel.create(req.body, userId);
      res
        .status(201)
        .json({
          message: "Vehicle created successfully!",
          vehicle: newVehicle,
        });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating vehicle.", error: error.message });
    }
  },

  async getMyVehicles(req, res) {
    try {
      const userId = req.user.userId;
      const vehicles = await vehicleModel.findByUserId(userId);
      res.status(200).json(vehicles);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching vehicles.", error: error.message });
    }
  },

  async updateVehicle(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const vehicle = await vehicleModel.findById(id);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found." });
      }
      if (vehicle.user_id !== userId) {
        return res
          .status(403)
          .json({ message: "Forbidden: You do not own this vehicle." });
      }
      const affectedRows = await vehicleModel.update(id, req.body);
      if (affectedRows > 0) {
        const updatedVehicle = await vehicleModel.findById(id);
        res
          .status(200)
          .json({
            message: "Vehicle updated successfully!",
            vehicle: updatedVehicle,
          });
      } else {
        res.status(404).json({ message: "Vehicle not found." });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating vehicle.", error: error.message });
    }
  },

  async deleteVehicle(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const vehicle = await vehicleModel.findById(id);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found." });
      }
      if (vehicle.user_id !== userId) {
        return res
          .status(403)
          .json({ message: "Forbidden: You do not own this vehicle." });
      }
      const affectedRows = await vehicleModel.delete(id);
      if (affectedRows > 0) {
        res.status(200).json({ message: "Vehicle deleted successfully." });
      } else {
        res.status(404).json({ message: "Vehicle not found." });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error deleting vehicle.", error: error.message });
    }
  },
};

module.exports = vehicleController;