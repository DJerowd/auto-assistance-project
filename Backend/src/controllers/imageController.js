const vehicleImageModel = require("../models/vehicleImageModel");
const vehicleModel = require("../models/vehicleModel");
const fs = require("fs");
const path = require("path");

const imageController = {
  async uploadImages(req, res, next) {
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

      if (!req.files || req.files.length === 0) {
        const error = new Error("No files uploaded.");
        error.statusCode = 400;
        throw error;
      }
      await vehicleImageModel.addImages(req.files, vehicleId);
      res
        .status(201)
        .json({ message: "Images uploaded successfully!", files: req.files });
    } catch (error) {
      if (req.files) {
        req.files.forEach((file) => fs.unlinkSync(file.path));
      }
      next(error);
    }
  },

  async deleteImage(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const image = await vehicleImageModel.findById(id);
      if (!image) {
        const error = new Error("Image not found.");
        error.statusCode = 404;
        throw error;
      }
      const vehicle = await vehicleModel.findById(image.vehicle_id);
      if (!vehicle || vehicle.user_id !== userId) {
        const error = new Error(
          "Forbidden: You do not have permission to delete this image."
        );
        error.statusCode = 403;
        throw error;
      }
      fs.unlink(
        path.join(__dirname, "..", "..", image.image_path),
        async (err) => {
          if (err) {
            console.error("Failed to delete physical file:", err);
          }
          await vehicleImageModel.delete(id);
          res.status(200).json({ message: "Image deleted successfully." });
        }
      );
    } catch (error) {
      next(error);
    }
  },
};

module.exports = imageController;