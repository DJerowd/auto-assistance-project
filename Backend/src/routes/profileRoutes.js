const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profileController");
const authMiddleware = require("../middlewares/authMiddleware");
const { validate } = require("../middlewares/validator");
const {
  updateProfileRules,
  changePasswordRules,
} = require("../middlewares/validators/profileValidator");

router.use(authMiddleware);

router
  .route("/")
  .get(profileController.getProfile)
  .put(updateProfileRules(), validate, profileController.updateProfile);

router.put(
  "/change-password",
  changePasswordRules(),
  validate,
  profileController.changePassword
);

module.exports = router;