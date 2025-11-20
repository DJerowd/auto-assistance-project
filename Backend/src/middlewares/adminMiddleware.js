const userModel = require("../models/userModel");

async function adminMiddleware(req, res, next) {
  try {
    const userId = req.user.userId;
    const user = await userModel.findById(userId);
    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = adminMiddleware;
