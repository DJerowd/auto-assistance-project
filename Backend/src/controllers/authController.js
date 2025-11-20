const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const authController = {
  async register(req, res, next) {
    const { name, email, password } = req.body;
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();
      const newUser = await userModel.createUser(
        name,
        email,
        password,
        connection
      );
      await connection.commit();
      res
        .status(201)
        .json({ message: "User registered successfully!", user: newUser });
    } catch (error) {
      if (connection) await connection.rollback();
      if (error.message.includes("Email already registered")) {
        error.statusCode = 409;
      }
      next(error);
    } finally {
      if (connection) connection.release();
    }
  },

  async login(req, res, next) {
    const { email, password } = req.body;
    try {
      const user = await userModel.findUserByEmail(email);
      if (!user) {
        const error = new Error("Invalid credentials.");
        error.statusCode = 401;
        throw error;
      }
      const isPasswordValid = await userModel.comparePassword(
        password,
        user.password
      );
      if (!isPasswordValid) {
        const error = new Error("Invalid credentials.");
        error.statusCode = 401;
        throw error;
      }
      const payload = { userId: user.id, email: user.email };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
      });
      res.status(200).json({
        message: "Login successful!",
        token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
