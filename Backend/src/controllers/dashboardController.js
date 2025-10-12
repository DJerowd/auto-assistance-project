const dashboardModel = require("../models/dashboardModel");

const dashboardController = {
  async getDashboardStats(req, res, next) {
    try {
      const userId = req.user.userId;
      const stats = await dashboardModel.getStatsByUserId(userId);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = dashboardController;