const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicleController");
const authMiddleware = require("../middlewares/authMiddleware");
const vehicleSubRoutes = require("./vehicleSubRoutes");
const { validate } = require("../middlewares/validator");
const { vehicleRules } = require("../middlewares/validators/vehicleValidator");

router.use(authMiddleware);

router
  .route("/")
  .post(vehicleRules(), validate, vehicleController.createVehicle)
  .get(vehicleController.getMyVehicles);

router
  .route("/:id")
  .get(vehicleController.getVehicleById)
  .put(vehicleRules(), validate, vehicleController.updateVehicle)
  .delete(vehicleController.deleteVehicle);

router.use("/:vehicleId", vehicleSubRoutes);

module.exports = router;