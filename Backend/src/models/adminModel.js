const pool = require("../config/database");

const adminModel = {
  async createItem(table, name, extraData = {}) {
    const allowedTables = ['brands', 'colors', 'features', 'service_types'];
    if (!allowedTables.includes(table)) throw new Error("Invalid table name");
    let sql = `INSERT INTO ${table} (name) VALUES (?)`;
    let params = [name];
    if (table === 'colors' && extraData.hex) {
        sql = `INSERT INTO colors (name, hex) VALUES (?, ?)`;
        params = [name, extraData.hex];
    }
    const [result] = await pool.query(sql, params);
    return { id: result.insertId, name, ...extraData };
  },

  async updateItem(table, id, name, extraData = {}) {
    const allowedTables = ['brands', 'colors', 'features', 'service_types'];
    if (!allowedTables.includes(table)) throw new Error("Invalid table name");
    let sql = `UPDATE ${table} SET name = ?`;
    let params = [name];
    if (table === 'colors' && extraData.hex) {
        sql += `, hex = ?`;
        params.push(extraData.hex);
    }
    sql += ` WHERE id = ?`;
    params.push(id);
    const [result] = await pool.query(sql, params);
    return result.affectedRows;
  },

  async deleteItem(table, id) {
    const allowedTables = ['brands', 'colors', 'features', 'service_types'];
    if (!allowedTables.includes(table)) throw new Error("Invalid table name");
    const sql = `DELETE FROM ${table} WHERE id = ?`;
    const [result] = await pool.query(sql, [id]);
    return result.affectedRows;
  },

  async getAllUsers() {
    const sql = "SELECT id, name, email, role, created_at FROM users ORDER BY name ASC";
    const [rows] = await pool.query(sql);
    return rows;
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
  }
};

module.exports = adminModel;