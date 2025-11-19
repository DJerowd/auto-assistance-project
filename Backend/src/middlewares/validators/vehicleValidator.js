const { body } = require("express-validator");

exports.vehicleRules = () => [
  body("model").trim().notEmpty().withMessage("Model is required."),
  body("current_mileage")
    .notEmpty()
    .withMessage("Current mileage is required.")
    .isInt({ min: 0 })
    .withMessage("Mileage must be a non-negative integer."),
  body("license_plate")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 7, max: 10 })
    .withMessage("License plate must be between 7 and 10 characters."),
  body("year_of_manufacture")
    .optional({ checkFalsy: true })
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage("Invalid year of manufacture."),
  body("year_model")
    .optional({ checkFalsy: true })
    .isInt({ min: 1900, max: new Date().getFullYear() + 2 })
    .withMessage("Invalid model year."),
  body("features")
    .optional()
    .isArray()
    .withMessage("Features must be an array of IDs."),
];