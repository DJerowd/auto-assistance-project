const express = require("express");
const router = express.Router({ mergeParams: true });

const maintenanceController = require("../controllers/maintenanceController");
const reminderController = require("../controllers/reminderController");
const imageController = require("../controllers/imageController");
const upload = require("../config/multerConfig");
const { validate } = require("../middlewares/validator");
const { maintenanceRules } = require("../middlewares/validators/maintenanceValidator");
const { reminderRules } = require("../middlewares/validators/reminderValidator");

router
  .route("/maintenances")
  .post(maintenanceRules(), validate, maintenanceController.addMaintenance)
  .get(maintenanceController.getVehicleMaintenances);

router
  .route("/reminders")
  .post(reminderRules(), validate, reminderController.addReminder)
  .get(reminderController.getVehicleReminders);

router.post("/images", upload.array("images", 5), imageController.uploadImages);

module.exports = router;