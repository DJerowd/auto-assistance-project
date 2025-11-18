const vehicleModel = require("../models/vehicleModel");
const maintenanceModel = require("../models/maintenanceModel");
const reminderModel = require("../models/reminderModel");
const vehicleImageModel = require("../models/vehicleImageModel");
const pool = require("../config/database");
const fs = require("fs").promises;
const path = require("path");

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
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();
      const userId = req.user.userId;
      const newVehicle = await vehicleModel.create(
        req.body,
        userId,
        connection
      );
      await connection.commit();
      res.status(201).json({
        message: "Vehicle created successfully!",
        vehicle: newVehicle,
      });
    } catch (error) {
      if (connection) await connection.rollback();
      next(error);
    } finally {
      if (connection) connection.release();
    }
  },

  async getMyVehicles(req, res, next) {
    try {
      const userId = req.user.userId;
      const {
        page = 1,
        limit = 10,
        sortBy = "created_at",
        order = "DESC",
        model,
        favorites,
      } = req.query;
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        order,
        model,
        favoritesOnly: favorites === "true",
      };
      const vehicles = await vehicleModel.findByUserId(userId, options);
      res.status(200).json(vehicles);
    } catch (error) {
      next(error);
    }
  },

  async getVehicleById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const vehicle = await checkVehicleOwnership(id, userId);
      res.status(200).json(vehicle);
    } catch (error) {
      next(error);
    }
  },

  async updateVehicle(req, res, next) {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();
      const { id } = req.params;
      const userId = req.user.userId;
      await checkVehicleOwnership(id, userId);
      const affectedRows = await vehicleModel.update(id, req.body, connection);
      if (affectedRows === 0) {
        const error = new Error("Vehicle not found.");
        error.statusCode = 404;
        throw error;
      }
      const updatedVehicle = await vehicleModel.findById(id);
      await connection.commit();
      res.status(200).json({
        message: "Vehicle updated successfully!",
        vehicle: updatedVehicle,
      });
    } catch (error) {
      if (connection) await connection.rollback();
      next(error);
    } finally {
      if (connection) connection.release();
    }
  },

  async toggleFavorite(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      await checkVehicleOwnership(id, userId);

      await vehicleModel.toggleFavorite(id);
      const updatedVehicle = await vehicleModel.findById(id);

      res.status(200).json({
        message: "Favorite status updated.",
        vehicle: updatedVehicle,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteVehicle(req, res, next) {
    let connection;
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      connection = await pool.getConnection();
      await connection.beginTransaction();
      await checkVehicleOwnership(id, userId);
      const { images } = await vehicleImageModel.deleteByVehicleId(
        id,
        connection
      );
      for (const image of images) {
        try {
          const imagePath = path.join(__dirname, "..", "..", image.image_path);
          await fs.unlink(imagePath);
        } catch (fileError) {
          if (fileError.code !== "ENOENT") {
            throw fileError;
          }
        }
      }
      await reminderModel.deleteByVehicleId(id, connection);
      await maintenanceModel.deleteByVehicleId(id, connection);
      const affectedRows = await vehicleModel.delete(id, connection);
      if (affectedRows === 0) {
        throw new Error("Vehicle not found during deletion.");
      }
      await connection.commit();
      res
        .status(200)
        .json({
          message: "Vehicle and all associated data deleted successfully.",
        });
    } catch (error) {
      if (connection) await connection.rollback();
      next(error);
    } finally {
      if (connection) connection.release();
    }
  },
};

module.exports = vehicleController;
