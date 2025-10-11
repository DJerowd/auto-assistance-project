const express = require("express");
const router = express.Router();
const imageController = require("../controllers/imageController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.delete("/:id", imageController.deleteImage);

module.exports = router;