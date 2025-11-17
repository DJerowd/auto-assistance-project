const vehicleImageModel = require("../models/vehicleImageModel");
const vehicleModel = require("../models/vehicleModel");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const pool = require("../config/database");

const imageController = {
  async uploadImages(req, res, next) {
    let connection;
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
      const processedImages = [];
      for (const file of req.files) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const newFilename = `images-${uniqueSuffix}.webp`;
        const newPath = path.join("public", "uploads", newFilename);
        await sharp(file.buffer)
          .resize({ width: 1280, withoutEnlargement: true })
          .toFormat("webp", { quality: 100 })
          .toFile(newPath);
        processedImages.push({ path: newPath.replace(/\\/g, "/") });
      }
      connection = await pool.getConnection();
      await connection.beginTransaction();
      await vehicleImageModel.addImages(processedImages, vehicleId, connection);
      await connection.commit();
      res.status(201).json({
        message: "Images uploaded and processed successfully!",
        files: processedImages,
      });
    } catch (error) {
      if (connection) await connection.rollback();
      next(error);
    } finally {
      if (connection) connection.release();
    }
  },

  async setPrimaryImage(req, res, next) {
    let connection;
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        connection = await pool.getConnection();
        await connection.beginTransaction();
        const image = await vehicleImageModel.findById(id);
        if (!image) {
            const error = new Error("Image not found.");
            error.statusCode = 404;
            throw error;
        }
        const vehicle = await vehicleModel.findById(image.vehicle_id);
        if (!vehicle || vehicle.user_id !== userId) {
            const error = new Error(
                "Forbidden: You do not have permission for this image."
            );
            error.statusCode = 403;
            throw error;
        }
        await vehicleImageModel.setAsPrimary(id, image.vehicle_id, connection);
        await connection.commit();
        res.status(200).json({ message: "Primary image updated successfully." });
    } catch (error) {
        if (connection) await connection.rollback();
        next(error);
    } finally {
        if (connection) connection.release();
    }
  },

  async deleteImage(req, res, next) {
    let connection;
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
      connection = await pool.getConnection();
      await connection.beginTransaction();
      const affectedRows = await vehicleImageModel.delete(id, connection);
      if (affectedRows > 0) {
        const filePath = path.join(__dirname, "..", "..", image.image_path);
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error("Failed to delete physical file:", err);
            }
          });
        }
      }
      await connection.commit();
      res.status(200).json({ message: "Image deleted successfully." });
    } catch (error) {
      if (connection) await connection.rollback();
      next(error);
    } finally {
      if (connection) connection.release();
    }
  },
};

module.exports = imageController;