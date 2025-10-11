const express = require("express");
const router = express.Router();
const maintenanceController = require("../controllers/maintenanceController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router
  .route("/:id")
  .put(maintenanceController.updateMaintenance)
  .delete(maintenanceController.deleteMaintenance);

module.exports = router;