const { body } = require("express-validator");

exports.reminderRules = () => [
  body("service_type").trim().notEmpty().withMessage("Service type is required."),
  body("mileage_threshold")
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Mileage threshold must be a positive integer."),
  body("date_threshold")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate()
    .withMessage("Date threshold must be a valid date in YYYY-MM-DD format."),
  body("status")
    .optional()
    .isIn(["PENDING", "COMPLETED", "CANCELLED"])
    .withMessage("Invalid status value."),
  body().custom((value, { req }) => {
    const { mileage_threshold, date_threshold } = req.body;
    if (!mileage_threshold && !date_threshold) {
      throw new Error(
        "At least one threshold is required: mileage_threshold or date_threshold."
      );
    }
    return true;
  }),
];