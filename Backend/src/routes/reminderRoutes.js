const express = require("express");
const router = express.Router();
const reminderController = require("../controllers/reminderController");
const authMiddleware = require("../middlewares/authMiddleware");
const { validate } = require("../middlewares/validator");
const { reminderRules } = require("../middlewares/validators/reminderValidator");

router.use(authMiddleware);

router
  .route("/:id")
  .put(reminderRules(), validate, reminderController.updateReminder)
  .delete(reminderController.deleteReminder);

module.exports = router;