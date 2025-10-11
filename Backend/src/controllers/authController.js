const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

const authController = {
  async register(req, res) {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    try {
      const newUser = await userModel.createUser(name, email, password);
      res
        .status(201)
        .json({ message: "User registered successfully!", user: newUser });
    } catch (error) {
      res.status(409).json({ message: error.message });
    }
  },

  async login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }
    try {
      const user = await userModel.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials." });
      }
      const isPasswordValid = await userModel.comparePassword(
        password,
        user.password
      );
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials." });
      }
      const payload = { userId: user.id, email: user.email };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.status(200).json({
        message: "Login successful!",
        token: token,
        user: { id: user.id, email: user.email, name: user.name },
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "An error occurred during login. " + error });
    }
  },
};

module.exports = authController;
