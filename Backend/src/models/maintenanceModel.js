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

  async findByUserId(userId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = "maintenance_date",
      order = "DESC",
      service_type = null,
      vehicle_model = null,
      startDate = null,
      endDate = null,
    } = options;
    const offset = (page - 1) * limit;
    const allowedSortBy = [
      "maintenance_date",
      "cost",
      "service_type",
      "vehicle_model",
    ];
    const safeSortBy = allowedSortBy.includes(sortBy)
      ? sortBy
      : "maintenance_date";
    const sortColumn =
      safeSortBy === "vehicle_model" ? "v.model" : `m.${safeSortBy}`;
    const safeOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";
    let whereClause = "WHERE v.user_id = ?";
    const params = [userId];
    if (service_type) {
      whereClause += " AND m.service_type LIKE ?";
      params.push(`%${service_type}%`);
    }
    if (vehicle_model) {
      whereClause += " AND v.model LIKE ?";
      params.push(`%${vehicle_model}%`);
    }
    if (startDate) {
      whereClause += " AND m.maintenance_date >= ?";
      params.push(startDate);
    }
    if (endDate) {
      whereClause += " AND m.maintenance_date <= ?";
      params.push(endDate);
    }
    const countSql = `
      SELECT COUNT(*) as total 
      FROM maintenances m
      JOIN vehicles v ON m.vehicle_id = v.id
      ${whereClause}
    `;
    const [countResult] = await pool.query(countSql, params);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);
    const dataSql = `
      SELECT m.*, v.model as vehicle_model, v.license_plate, v.nickname
      FROM maintenances m
      JOIN vehicles v ON m.vehicle_id = v.id
      ${whereClause}
      ORDER BY ${sortColumn} ${safeOrder}
      LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);
    const [rows] = await pool.query(dataSql, params);
    return {
      data: rows,
      pagination: { totalItems, totalPages, currentPage: page, limit },
    };
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
