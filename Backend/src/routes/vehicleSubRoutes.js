const express = require("express");
const router = express.Router({ mergeParams: true });
const maintenanceController = require("../controllers/maintenanceController");
const imageController = require("../controllers/imageController");
const upload = require("../config/multerConfig");
const { validate } = require("../middlewares/validator");
const { maintenanceRules } = require("../middlewares/validators/maintenanceValidator");

router
  .route("/maintenances")
  .post(maintenanceRules(), validate, maintenanceController.addMaintenance)
  .get(maintenanceController.getVehicleMaintenances);

router.post("/images", upload.array("images", 5), imageController.uploadImages);

module.exports = router;