const express = require("express");
const router = express.Router();
const dataLoaderController = require("../controllers/dataLoaderController");

router.get("/vehicle-options", dataLoaderController.getVehicleOptions);

module.exports = router;
