const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

router.use(authMiddleware, adminMiddleware);

router.post("/brands", adminController.createBrand);
router.put("/brands/:id", adminController.updateBrand);
router.delete("/brands/:id", adminController.deleteBrand);

router.post("/colors", adminController.createColor);
router.put("/colors/:id", adminController.updateColor);
router.delete("/colors/:id", adminController.deleteColor);

router.post("/features", adminController.createFeature);
router.put("/features/:id", adminController.updateFeature);
router.delete("/features/:id", adminController.deleteFeature);

router.post("/service-types", adminController.createServiceType);
router.put("/service-types/:id", adminController.updateServiceType);
router.delete("/service-types/:id", adminController.deleteServiceType);

router.get("/users", adminController.getUsers);
router.patch("/users/:id/role", adminController.updateUserRole);
router.delete("/users/:id", adminController.deleteUser);

router.get("/vehicles", adminController.getAllVehicles);
router.delete("/vehicles/:id", adminController.deleteVehicle);

module.exports = router;
