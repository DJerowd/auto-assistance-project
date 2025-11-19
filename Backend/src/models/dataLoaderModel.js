const pool = require("../config/database");

const dataLoaderModel = {
  async getBrands() {
    const sql = "SELECT id, name FROM brands ORDER BY name ASC";
    const [rows] = await pool.query(sql);
    return rows;
  },

  async getColors() {
    const sql = "SELECT id, name, hex FROM colors ORDER BY name ASC";
    const [rows] = await pool.query(sql);
    return rows;
  },

  async getFeatures() {
    const sql = "SELECT id, name FROM features ORDER BY name ASC";
    const [rows] = await pool.query(sql);
    return rows;
  },
};

module.exports = dataLoaderModel;
