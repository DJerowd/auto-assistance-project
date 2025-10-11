const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicleController");
const authMiddleware = require("../middlewares/authMiddleware");
const vehicleSubRoutes = require("./vehicleSubRoutes");

router.use(authMiddleware);

router
  .route("/")
  .post(vehicleController.createVehicle)
  .get(vehicleController.getMyVehicles);

router
  .route("/:id")
  .put(vehicleController.updateVehicle)
  .delete(vehicleController.deleteVehicle);

router.use("/:vehicleId", vehicleSubRoutes);

module.exports = router;