const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = {};
  errors.array().forEach((err) => {
    if (!extractedErrors[err.path]) {
      extractedErrors[err.path] = err.msg;
    }
  });
  return res.status(422).json({
    message: "Validation failed. The provided data is invalid.",
    errors: extractedErrors,
  });
};

module.exports = { validate };