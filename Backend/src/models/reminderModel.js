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