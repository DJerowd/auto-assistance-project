const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    statusCode: 429,
    message:
      "Too many login attempts from this IP, please try again after 10 minutes.",
  },
});

module.exports = {
  loginLimiter,
};