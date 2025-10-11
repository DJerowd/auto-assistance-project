const pool = require("../config/database");

const reminderModel = {
  async create(reminderData, vehicleId) {
    const { service_type, mileage_threshold, date_threshold, notes } =
      reminderData;
    const sql = `
      INSERT INTO reminders (vehicle_id, service_type, mileage_threshold, date_threshold, notes)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(sql, [
      vehicleId,
      service_type,
      mileage_threshold,
      date_threshold,
      notes,
    ]);
    return { id: result.insertId, ...reminderData, vehicle_id: vehicleId };
  },

  async findByVehicleId(vehicleId) {
    const sql =
      "SELECT * FROM reminders WHERE vehicle_id = ? ORDER BY created_at DESC";
    const [rows] = await pool.query(sql, [vehicleId]);
    return rows;
  },

  async findById(reminderId) {
    const sql = "SELECT * FROM reminders WHERE id = ?";
    const [rows] = await pool.query(sql, [reminderId]);
    return rows[0];
  },

  async update(reminderId, reminderData) {
    const { service_type, mileage_threshold, date_threshold, status, notes } =
      reminderData;
    const sql = `
      UPDATE reminders
      SET service_type = ?, mileage_threshold = ?, date_threshold = ?, status = ?, notes = ?
      WHERE id = ?
    `;
    const [result] = await pool.query(sql, [
      service_type,
      mileage_threshold,
      date_threshold,
      status,
      notes,
      reminderId,
    ]);
    return result.affectedRows;
  },

  async delete(reminderId) {
    const sql = "DELETE FROM reminders WHERE id = ?";
    const [result] = await pool.query(sql, [reminderId]);
    return result.affectedRows;
  },
};

module.exports = reminderModel;