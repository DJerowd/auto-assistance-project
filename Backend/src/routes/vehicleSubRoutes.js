const express = require("express");
const router = express.Router({ mergeParams: true });

const maintenanceController = require("../controllers/maintenanceController");

router
  .route("/maintenances")
  .post(maintenanceController.addMaintenance)
  .get(maintenanceController.getVehicleMaintenances);

module.exports = router;