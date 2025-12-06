const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const pool = require("../config/database");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const profileController = {
  async getProfile(req, res, next) {
    try {
      const userId = req.user.userId;
      const user = await userModel.findById(userId);
      if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req, res, next) {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();
      const userId = req.user.userId;
      const { name, email } = req.body;
      const currentUser = await userModel.findById(userId);
      if (!currentUser) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
      }
      const dataToUpdate = {
        name: name || currentUser.name,
        email: email || currentUser.email,
      };
      await userModel.update(userId, dataToUpdate, connection);
      const updatedUser = await userModel.findById(userId);
      await connection.commit();
      res
        .status(200)
        .json({ message: "Profile updated successfully!", user: updatedUser });
    } catch (error) {
      if (connection) await connection.rollback();
      if (error.message.includes("Email is already in use")) {
        error.statusCode = 409;
      }
      next(error);
    } finally {
      if (connection) connection.release();
    }
  },

  async changePassword(req, res, next) {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();
      const userId = req.user.userId;
      const { currentPassword, newPassword } = req.body;
      const user = await userModel.findUserByEmail(req.user.email);
      if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
      }
      const isPasswordValid = await userModel.comparePassword(
        currentPassword,
        user.password
      );
      if (!isPasswordValid) {
        const error = new Error("Invalid current password.");
        error.statusCode = 401;
        throw error;
      }
      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(newPassword, salt);
      await userModel.updatePassword(userId, newPasswordHash, connection);
      await connection.commit();
      res.status(200).json({ message: "Password changed successfully." });
    } catch (error) {
      if (connection) await connection.rollback();
      next(error);
    } finally {
      if (connection) connection.release();
    }
  },
  
  async uploadAvatar(req, res, next) {
    let connection;
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided." });
      }
      const userId = req.user.userId;
      const user = await userModel.findById(userId);
      if (user.profile_image) {
        const oldPath = path.join(__dirname, "..", "..", user.profile_image);
        if (fs.existsSync(oldPath)) {
          fs.unlink(oldPath, (err) => {
            if (err) console.error(err);
          });
        }
      }
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const newFilename = `avatar-${userId}-${uniqueSuffix}.webp`;
      const newPath = path.join("public", "uploads", newFilename);

      await sharp(req.file.buffer)
        .resize(300, 300, { fit: "cover" })
        .toFormat("webp", { quality: 90 })
        .toFile(newPath);
      const dbPath = `public/uploads/${newFilename}`;
      connection = await pool.getConnection();
      await userModel.updateProfileImage(userId, dbPath, connection);
      const fullUrl = `${process.env.APP_URL}/${dbPath}`;
      res.status(200).json({
        message: "Profile image updated.",
        profile_image: fullUrl,
        path: dbPath,
      });
    } catch (error) {
      next(error);
    } finally {
      if (connection) connection.release();
    }
  },

  async deleteAvatar(req, res, next) {
    let connection;
    try {
      const userId = req.user.userId;
      const user = await userModel.findById(userId);
      if (user.profile_image) {
        const oldPath = path.join(__dirname, "..", "..", user.profile_image);
        if (fs.existsSync(oldPath)) {
          fs.unlink(oldPath, (err) => {
            if (err) console.error(err);
          });
        }
      }
      connection = await pool.getConnection();
      await userModel.updateProfileImage(userId, null, connection);
      res.status(200).json({ message: "Profile image removed." });
    } catch (error) {
      next(error);
    } finally {
      if (connection) connection.release();
    }
  },
};

module.exports = profileController;
