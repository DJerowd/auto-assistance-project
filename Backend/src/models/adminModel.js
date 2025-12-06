const pool = require("../config/database");

const adminModel = {
  async createItem(table, name, extraData = {}) {
    const allowedTables = ["brands", "colors", "features", "service_types"];
    if (!allowedTables.includes(table)) throw new Error("Invalid table name");
    let sql = `INSERT INTO ${table} (name) VALUES (?)`;
    let params = [name];
    if (table === "colors" && extraData.hex) {
      sql = `INSERT INTO colors (name, hex) VALUES (?, ?)`;
      params = [name, extraData.hex];
    }
    const [result] = await pool.query(sql, params);
    return { id: result.insertId, name, ...extraData };
  },

  async updateItem(table, id, name, extraData = {}) {
    const allowedTables = ["brands", "colors", "features", "service_types"];
    if (!allowedTables.includes(table)) throw new Error("Invalid table name");
    let sql = `UPDATE ${table} SET name = ?`;
    let params = [name];
    if (table === "colors" && extraData.hex) {
      sql += `, hex = ?`;
      params.push(extraData.hex);
    }
    sql += ` WHERE id = ?`;
    params.push(id);
    const [result] = await pool.query(sql, params);
    return result.affectedRows;
  },

  async deleteItem(table, id) {
    const allowedTables = ["brands", "colors", "features", "service_types"];
    if (!allowedTables.includes(table)) throw new Error("Invalid table name");
    const sql = `DELETE FROM ${table} WHERE id = ?`;
    const [result] = await pool.query(sql, [id]);
    return result.affectedRows;
  },

  async getAllUsers(search = "", page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = "";
    if (search) {
      whereClause = " WHERE name LIKE ? OR email LIKE ?";
      params.push(`%${search}%`, `%${search}%`);
    }
    const countSql = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const [countResult] = await pool.query(countSql, params);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);
    let dataSql = `SELECT id, name, email, role, created_at FROM users ${whereClause} ORDER BY name ASC LIMIT ? OFFSET ?`;
    const dataParams = [...params, parseInt(limit), parseInt(offset)];
    const [rows] = await pool.query(dataSql, dataParams);
    return {
      data: rows,
      pagination: {
        totalItems,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    };
  },

  async updateUserRole(userId, newRole) {
    const sql = "UPDATE users SET role = ? WHERE id = ?";
    const [result] = await pool.query(sql, [newRole, userId]);
    return result.affectedRows;
  },

  async deleteUser(userId) {
    const sql = "DELETE FROM users WHERE id = ?";
    const [result] = await pool.query(sql, [userId]);
    return result.affectedRows;
  },
};

module.exports = adminModel;
