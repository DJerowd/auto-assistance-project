const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profileController");
const authMiddleware = require("../middlewares/authMiddleware");
const { validate } = require("../middlewares/validator");
const upload = require("../config/multerConfig");
const {
  updateProfileRules,
  changePasswordRules,
} = require("../middlewares/validators/profileValidator");

router.use(authMiddleware);

router
  .route("/")
  .get(profileController.getProfile)
  .put(updateProfileRules(), validate, profileController.updateProfile);

router.post("/avatar", upload.single("avatar"), profileController.uploadAvatar);
router.delete("/avatar", profileController.deleteAvatar);

router.put(
  "/change-password",
  changePasswordRules(),
  validate,
  profileController.changePassword
);

module.exports = router;
