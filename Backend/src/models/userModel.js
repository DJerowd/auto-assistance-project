const pool = require("../config/database");
const bcrypt = require("bcryptjs");

const userModel = {
  async createUser(name, email, password) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    try {
      const [result] = await pool.query(sql, [name, email, passwordHash]);
      return { id: result.insertId, email, name };
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        throw new Error("Email already registered.");
      }
      throw error;
    }
  },

  async findUserByEmail(email) {
    const sql = "SELECT * FROM users WHERE email = ?";
    const [rows] = await pool.query(sql, [email]);
    return rows[0];
  },

  async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },
};

module.exports = userModel;
