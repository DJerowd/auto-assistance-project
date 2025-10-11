const pool = require("../config/database");

const vehicleModel = {
  async create(vehicleData, userId) {
    const {
      brand_id,
      color_id,
      license_plate,
      model,
      year_of_manufacture,
      year_model,
      current_mileage,
      nickname,
    } = vehicleData;
    const sql = `
      INSERT INTO vehicles (user_id, brand_id, color_id, license_plate, model, year_of_manufacture, year_model, current_mileage, nickname)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(sql, [
      userId,
      brand_id,
      color_id,
      license_plate,
      model,
      year_of_manufacture,
      year_model,
      current_mileage,
      nickname,
    ]);
    return { id: result.insertId, ...vehicleData, user_id: userId };
  },

  async findByUserId(userId) {
    const sql = `
      SELECT v.*, b.name as brand_name, c.name as color_name
      FROM vehicles v
      LEFT JOIN brands b ON v.brand_id = b.id
      LEFT JOIN colors c ON v.color_id = c.id
      WHERE v.user_id = ?
    `;
    const [rows] = await pool.query(sql, [userId]);
    return rows;
  },

  async findById(vehicleId) {
    const sql = `
      SELECT v.*, b.name as brand_name, c.name as color_name
      FROM vehicles v
      LEFT JOIN brands b ON v.brand_id = b.id
      LEFT JOIN colors c ON v.color_id = c.id
      WHERE v.id = ?
    `;
    const [rows] = await pool.query(sql, [vehicleId]);
    return rows[0];
  },

  async update(vehicleId, vehicleData) {
    const {
      brand_id,
      color_id,
      license_plate,
      model,
      year_of_manufacture,
      year_model,
      current_mileage,
      nickname,
    } = vehicleData;
    const sql = `
      UPDATE vehicles
      SET brand_id = ?, color_id = ?, license_plate = ?, model = ?, year_of_manufacture = ?, year_model = ?, current_mileage = ?, nickname = ?
      WHERE id = ?
    `;
    const [result] = await pool.query(sql, [
      brand_id,
      color_id,
      license_plate,
      model,
      year_of_manufacture,
      year_model,
      current_mileage,
      nickname,
      vehicleId,
    ]);
    return result.affectedRows;
  },

  async delete(vehicleId) {
    const sql = "DELETE FROM vehicles WHERE id = ?";
    const [result] = await pool.query(sql, [vehicleId]);
    return result.affectedRows;
  },
};

module.exports = vehicleModel;