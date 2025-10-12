const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');

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
    try {
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
      await userModel.update(userId, dataToUpdate);
      const updatedUser = await userModel.findById(userId);
      res.status(200).json({ message: 'Profile updated successfully!', user: updatedUser });
    } catch (error) {
      if (error.message.includes("Email is already in use")) {
        error.statusCode = 409;
      }
      next(error);
    }
  },

  async changePassword(req, res, next) {
    try {
      const userId = req.user.userId;
      const { currentPassword, newPassword } = req.body;
      const user = await userModel.findUserByEmail(req.user.email);
      if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
      }
      const isPasswordValid = await userModel.comparePassword(currentPassword, user.password);
      if (!isPasswordValid) {
        const error = new Error("Invalid current password.");
        error.statusCode = 401;
        throw error;
      }
      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(newPassword, salt);
      await userModel.updatePassword(userId, newPasswordHash);
      res.status(200).json({ message: 'Password changed successfully.' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = profileController;