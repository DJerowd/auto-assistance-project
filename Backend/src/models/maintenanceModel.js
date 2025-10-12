const pool = require("../config/database");

const maintenanceModel = {
  async create(maintenanceData, vehicleId, connection = pool) {
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
    const [result] = await connection.query(sql, [
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

  async findByVehicleId(vehicleId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = "maintenance_date",
      order = "DESC",
      service_type = null,
    } = options;
    const offset = (page - 1) * limit;
    const allowedSortBy = [
      "id",
      "service_type",
      "maintenance_date",
      "mileage",
      "cost",
    ];
    const safeSortBy = allowedSortBy.includes(sortBy)
      ? sortBy
      : "maintenance_date";
    const safeOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";
    let countSql =
      "SELECT COUNT(*) as total FROM maintenances WHERE vehicle_id = ?";
    const params = [vehicleId];
    if (service_type) {
      countSql += " AND service_type LIKE ?";
      params.push(`%${service_type}%`);
    }
    const [countResult] = await pool.query(countSql, params);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);
    let dataSql = "SELECT * FROM maintenances WHERE vehicle_id = ?";
    if (service_type) {
      dataSql += " AND service_type LIKE ?";
    }
    dataSql += ` ORDER BY ${safeSortBy} ${safeOrder} LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    const [maintenances] = await pool.query(dataSql, params);
    return {
      data: maintenances,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  },

  async findById(maintenanceId) {
    const sql = "SELECT * FROM maintenances WHERE id = ?";
    const [rows] = await pool.query(sql, [maintenanceId]);
    return rows[0];
  },

  async update(maintenanceId, maintenanceData, connection = pool) {
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
    const [result] = await connection.query(sql, [
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

  async delete(maintenanceId, connection = pool) {
    const sql = "DELETE FROM maintenances WHERE id = ?";
    const [result] = await connection.query(sql, [maintenanceId]);
    return result.affectedRows;
  },
  
  async deleteByVehicleId(vehicleId, connection = pool) {
    const sql = "DELETE FROM maintenances WHERE vehicle_id = ?";
    const [result] = await connection.query(sql, [vehicleId]);
    return result.affectedRows;
  },
};

module.exports = maintenanceModel;