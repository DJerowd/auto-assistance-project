const pool = require("../config/database");

const maintenanceModel = {
  async create(maintenanceData, vehicleId) {
    const {
      service_type,
      maintenance_date,
      mileage,
      cost,
      service_provider,
      notes,
    } = maintenanceData;
    const sql = `
      INSERT INTO maintenances (vehicle_id, service_type, maintenance_date, mileage, cost, service_provider, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(sql, [
      vehicleId,
      service_type,
      maintenance_date,
      mileage,
      cost,
      service_provider,
      notes,
    ]);
    return { id: result.insertId, ...maintenanceData, vehicle_id: vehicleId };
  },

  async findByVehicleId(vehicleId) {
    const sql =
      "SELECT * FROM maintenances WHERE vehicle_id = ? ORDER BY maintenance_date DESC";
    const [rows] = await pool.query(sql, [vehicleId]);
    return rows;
  },

  async findById(maintenanceId) {
    const sql = "SELECT * FROM maintenances WHERE id = ?";
    const [rows] = await pool.query(sql, [maintenanceId]);
    return rows[0];
  },

  async update(maintenanceId, maintenanceData) {
    const {
      service_type,
      maintenance_date,
      mileage,
      cost,
      service_provider,
      notes,
    } = maintenanceData;
    const sql = `
      UPDATE maintenances
      SET service_type = ?, maintenance_date = ?, mileage = ?, cost = ?, service_provider = ?, notes = ?
      WHERE id = ?
    `;
    const [result] = await pool.query(sql, [
      service_type,
      maintenance_date,
      mileage,
      cost,
      service_provider,
      notes,
      maintenanceId,
    ]);
    return result.affectedRows;
  },

  async delete(maintenanceId) {
    const sql = "DELETE FROM maintenances WHERE id = ?";
    const [result] = await pool.query(sql, [maintenanceId]);
    return result.affectedRows;
  },
};

module.exports = maintenanceModel;