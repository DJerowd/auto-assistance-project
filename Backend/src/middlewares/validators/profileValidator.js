const { body } = require("express-validator");

exports.updateProfileRules = () => [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty."),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email address."),
];

exports.changePasswordRules = () => [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required."),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long."),
  body("confirmNewPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("New password confirmation does not match.");
    }
    return true;
  }),
];