const express = require("express");
const router = express.Router();
const maintenanceController = require("../controllers/maintenanceController");
const authMiddleware = require("../middlewares/authMiddleware");
const { validate } = require("../middlewares/validator");
const { maintenanceRules } = require("../middlewares/validators/maintenanceValidator");

router.use(authMiddleware);

router
  .route("/:id")
  .get(maintenanceController.getMaintenanceById)
  .put(maintenanceRules(), validate, maintenanceController.updateMaintenance)
  .delete(maintenanceController.deleteMaintenance);

module.exports = router;