const adminModel = require("../models/adminModel");

const adminController = {
  async createBrand(req, res, next) {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ message: "Name is required" });
      const newItem = await adminModel.createItem("brands", name);
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
      await adminModel.updateItem("brands", id, name);
      res.status(200).json({ message: "Brand updated successfully" });
    } catch (error) {
      next(error);
    }
  },
  async deleteBrand(req, res, next) {
    try {
      const { id } = req.params;
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
      const users = await adminModel.getAllUsers();
      res.status(200).json(users);
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
};

module.exports = adminController;
