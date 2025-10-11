const { body } = require("express-validator");

exports.maintenanceRules = () => [
  body("service_type").trim().notEmpty().withMessage("Service type is required."),
  body("maintenance_date")
    .notEmpty()
    .withMessage("Maintenance date is required.")
    .isISO8601()
    .toDate()
    .withMessage("Must be a valid date in YYYY-MM-DD format."),
  body("mileage")
    .notEmpty()
    .withMessage("Mileage is required.")
    .isInt({ min: 0 })
    .withMessage("Mileage must be a non-negative integer."),
  body("cost")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("Cost must be a non-negative number."),
];