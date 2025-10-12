const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { validate } = require("../middlewares/validator");
const {
  registerRules,
  loginRules,
} = require("../middlewares/validators/authValidator");
const { loginLimiter } = require("../middlewares/rateLimiter");

router.post("/register", registerRules(), validate, authController.register);

router.post(
  "/login",
  loginLimiter,
  loginRules(),
  validate,
  authController.login
);

module.exports = router;