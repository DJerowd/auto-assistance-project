const pool = require("../config/database");

const reminderModel = {
  async create(reminderData, vehicleId, connection = pool) {
    const { service_type, mileage_threshold, date_threshold, notes } =
      reminderData;
    const sql = `
      INSERT INTO reminders (vehicle_id, service_type, mileage_threshold, date_threshold, notes)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await connection.query(sql, [
      vehicleId,
      service_type,
      mileage_threshold,
      date_threshold,
      notes,
    ]);
    return { id: result.insertId, ...reminderData, vehicle_id: vehicleId };
  },

  async findByUserId(userId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = "date_threshold",
      order = "ASC",
      status = null,
      service_type = null,
      vehicle_model = null,
    } = options;
    const offset = (page - 1) * limit;
    const allowedSortBy = [
      "date_threshold",
      "mileage_threshold",
      "status",
      "service_type",
      "vehicle_model",
    ];
    const safeSortBy = allowedSortBy.includes(sortBy)
      ? sortBy
      : "date_threshold";
    const sortColumn =
      safeSortBy === "vehicle_model" ? "v.model" : `r.${safeSortBy}`;
    const safeOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";
    let whereClause = "WHERE v.user_id = ?";
    const params = [userId];
    if (status) {
      whereClause += " AND r.status = ?";
      params.push(status);
    }
    if (service_type) {
      whereClause += " AND r.service_type LIKE ?";
      params.push(`%${service_type}%`);
    }
    if (vehicle_model) {
      whereClause += " AND v.model LIKE ?";
      params.push(`%${vehicle_model}%`);
    }
    const countSql = `
      SELECT COUNT(*) as total 
      FROM reminders r
      JOIN vehicles v ON r.vehicle_id = v.id
      ${whereClause}
    `;
    const [countResult] = await pool.query(countSql, params);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);
    const dataSql = `
      SELECT r.*, v.model as vehicle_model, v.license_plate, v.nickname, v.current_mileage as vehicle_current_mileage
      FROM reminders r
      JOIN vehicles v ON r.vehicle_id = v.id
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
      sortBy = "created_at",
      order = "DESC",
      status = null,
    } = options;
    const offset = (page - 1) * limit;
    const allowedSortBy = [
      "id",
      "service_type",
      "mileage_threshold",
      "date_threshold",
      "status",
      "created_at",
    ];
    const safeSortBy = allowedSortBy.includes(sortBy) ? sortBy : "created_at";
    const safeOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";
    let countSql =
      "SELECT COUNT(*) as total FROM reminders WHERE vehicle_id = ?";
    const params = [vehicleId];
    if (status) {
      countSql += " AND status = ?";
      params.push(status);
    }
    const [countResult] = await pool.query(countSql, params);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);
    let dataSql = "SELECT * FROM reminders WHERE vehicle_id = ?";
    if (status) {
      dataSql += " AND status = ?";
    }
    dataSql += ` ORDER BY ${safeSortBy} ${safeOrder} LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    const [reminders] = await pool.query(dataSql, params);
    return {
      data: reminders,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  },

  async findById(reminderId) {
    const sql = "SELECT * FROM reminders WHERE id = ?";
    const [rows] = await pool.query(sql, [reminderId]);
    return rows[0];
  },

  async findAllDueReminders() {
    const sql = `
      SELECT
        r.id as reminderId,
        r.service_type,
        r.mileage_threshold,
        r.date_threshold,
        v.id as vehicleId,
        v.model as vehicleModel,
        v.nickname as vehicleNickname,
        v.current_mileage,
        u.name as userName,
        u.email as userEmail
      FROM reminders r
      JOIN vehicles v ON r.vehicle_id = v.id
      JOIN users u ON v.user_id = u.id
      WHERE 
        r.status = 'PENDING' AND (
          (r.date_threshold IS NOT NULL AND r.date_threshold BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY))
          OR
          (r.mileage_threshold IS NOT NULL AND (r.mileage_threshold - v.current_mileage) <= 500)
        )
    `;
    const [rows] = await pool.query(sql);
    return rows;
  },

  async update(reminderId, reminderData, connection = pool) {
    const { service_type, mileage_threshold, date_threshold, status, notes } =
      reminderData;
    const sql = `
      UPDATE reminders
      SET service_type = ?, mileage_threshold = ?, date_threshold = ?, status = ?, notes = ?
      WHERE id = ?
    `;
    const [result] = await connection.query(sql, [
      service_type,
      mileage_threshold,
      date_threshold,
      status,
      notes,
      reminderId,
    ]);
    return result.affectedRows;
  },

  async delete(reminderId, connection = pool) {
    const sql = "DELETE FROM reminders WHERE id = ?";
    const [result] = await connection.query(sql, [reminderId]);
    return result.affectedRows;
  },

  async deleteByVehicleId(vehicleId, connection = pool) {
    const sql = "DELETE FROM reminders WHERE vehicle_id = ?";
    const [result] = await connection.query(sql, [vehicleId]);
    return result.affectedRows;
  },
};

module.exports = reminderModel;
