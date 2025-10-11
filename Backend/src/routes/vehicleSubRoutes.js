const express = require("express");
const router = express.Router({ mergeParams: true });
const maintenanceController = require("../controllers/maintenanceController");
const { validate } = require("../middlewares/validator");
const { maintenanceRules } = require("../middlewares/validators/maintenanceValidator");

router
  .route("/maintenances")
  .post(maintenanceRules(), validate, maintenanceController.addMaintenance)
  .get(maintenanceController.getVehicleMaintenances);

module.exports = router;