const adminModel = require("../models/adminModel");
const vehicleModel = require("../models/vehicleModel");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const processBrandLogo = async (file) => {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const newFilename = `brand-${uniqueSuffix}.webp`;
  const newPath = path.join("public", "uploads", newFilename);
  const dir = path.dirname(newPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  await sharp(file.buffer)
    .resize(200, 200, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .toFormat("webp", { quality: 90 })
    .toFile(newPath);
  return `public/uploads/${newFilename}`;
};

const deleteFile = (relativePath) => {
  if (!relativePath) return;
  const fullPath = path.join(__dirname, "..", "..", relativePath);
  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, (err) => {
      if (err) console.error(err);
    });
  }
};

const adminController = {
  async createBrand(req, res, next) {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ message: "Name is required" });
      let logoPath = null;
      if (req.file) {
        logoPath = await processBrandLogo(req.file);
      }
      const newItem = await adminModel.createItem("brands", name, {
        logo_path: logoPath,
      });
      if (newItem.logo_path) {
        newItem.logo_url = `${process.env.APP_URL}/${newItem.logo_path}`;
      }
      res.status(201).json(newItem);
    } catch (error) {
      next(error);
    }
  },
  async updateBrand(req, res, next) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      if (!name) return res.status(400).json({ message: "Name is required" });
      let extraData = {};
      if (req.file) {
        const oldBrand = await adminModel.getItemById("brands", id);
        if (oldBrand && oldBrand.logo_path) {
          deleteFile(oldBrand.logo_path);
        }
        extraData.logo_path = await processBrandLogo(req.file);
      }
      await adminModel.updateItem("brands", id, name, extraData);
      res
        .status(200)
        .json({
          message: "Brand updated successfully",
          logo_path: extraData.logo_path,
        });
    } catch (error) {
      next(error);
    }
  },
  async deleteBrand(req, res, next) {
    try {
      const { id } = req.params;
      const brand = await adminModel.getItemById("brands", id);
      if (brand && brand.logo_path) {
        deleteFile(brand.logo_path);
      }
      await adminModel.deleteItem("brands", id);
      res.status(200).json({ message: "Brand deleted" });
    } catch (error) {
      next(error);
    }
  },

  async createColor(req, res, next) {
    try {
      const { name, hex } = req.body;
      if (!name || !hex)
        return res.status(400).json({ message: "Name and Hex are required" });
      const newItem = await adminModel.createItem("colors", name, { hex });
      res.status(201).json(newItem);
    } catch (error) {
      next(error);
    }
  },
  async updateColor(req, res, next) {
    try {
      const { id } = req.params;
      const { name, hex } = req.body;
      if (!name || !hex)
        return res
          .status(400)
          .json({ message: "Name and Hex color are required" });
      await adminModel.updateItem("colors", id, name, { hex });
      res.status(200).json({ message: "Color updated successfully" });
    } catch (error) {
      next(error);
    }
  },
  async deleteColor(req, res, next) {
    try {
      const { id } = req.params;
      await adminModel.deleteItem("colors", id);
      res.status(200).json({ message: "Color deleted" });
    } catch (error) {
      next(error);
    }
  },

  async createFeature(req, res, next) {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ message: "Name is required" });
      const newItem = await adminModel.createItem("features", name);
      res.status(201).json(newItem);
    } catch (error) {
      next(error);
    }
  },
  async updateFeature(req, res, next) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      if (!name) return res.status(400).json({ message: "Name is required" });
      await adminModel.updateItem("features", id, name);
      res.status(200).json({ message: "Feature updated successfully" });
    } catch (error) {
      next(error);
    }
  },
  async deleteFeature(req, res, next) {
    try {
      const { id } = req.params;
      await adminModel.deleteItem("features", id);
      res.status(200).json({ message: "Feature deleted" });
    } catch (error) {
      next(error);
    }
  },

  async createServiceType(req, res, next) {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ message: "Name is required" });
      const newItem = await adminModel.createItem("service_types", name);
      res.status(201).json(newItem);
    } catch (error) {
      next(error);
    }
  },
  async updateServiceType(req, res, next) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      if (!name) return res.status(400).json({ message: "Name is required" });
      await adminModel.updateItem("service_types", id, name);
      res.status(200).json({ message: "Service Type updated successfully" });
    } catch (error) {
      next(error);
    }
  },
  async deleteServiceType(req, res, next) {
    try {
      const { id } = req.params;
      await adminModel.deleteItem("service_types", id);
      res.status(200).json({ message: "Service Type deleted successfully" });
    } catch (error) {
      next(error);
    }
  },

  async getUsers(req, res, next) {
    try {
      const { search, page, limit } = req.query;
      const result = await adminModel.getAllUsers(
        search,
        page ? parseInt(page) : 1,
        limit ? parseInt(limit) : 10
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      if (!["ADMIN", "USER"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      await adminModel.updateUserRole(id, role);
      res.status(200).json({ message: "User role updated successfully" });
    } catch (error) {
      next(error);
    }
  },
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      if (parseInt(id) === req.user.userId) {
        return res
          .status(400)
          .json({ message: "You cannot delete your own account." });
      }
      await adminModel.deleteUser(id);
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      next(error);
    }
  },

  async getAllVehicles(req, res, next) {
    try {
      const { page, limit, ownerEmail, model } = req.query;
      const result = await vehicleModel.findAll({
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
        ownerEmail,
        model,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async deleteVehicle(req, res, next) {
    try {
      const { id } = req.params;
      await vehicleModel.delete(id);
      const vehicleImageModel = require("../models/vehicleImageModel");
      const reminderModel = require("../models/reminderModel");
      const maintenanceModel = require("../models/maintenanceModel");
      const pool = require("../config/database");
      const fs = require("fs").promises;
      const path = require("path");
      const connection = await require("../config/database").getConnection();
      try {
        await connection.beginTransaction();
        const { images } = await vehicleImageModel.deleteByVehicleId(
          id,
          connection
        );
        for (const image of images) {
          try {
            const imagePath = path.join(
              __dirname,
              "..",
              "..",
              image.image_path
            );
            await fs.unlink(imagePath);
          } catch (e) {}
        }
        await reminderModel.deleteByVehicleId(id, connection);
        await maintenanceModel.deleteByVehicleId(id, connection);
        await vehicleModel.delete(id, connection);
        await connection.commit();
        res.status(200).json({ message: "Vehicle deleted by admin." });
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    } catch (error) {
      next(error);
    }
  },
};

module.exports = adminController;
