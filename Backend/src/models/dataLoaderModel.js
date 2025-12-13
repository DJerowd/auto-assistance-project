const pool = require("../config/database");

const dataLoaderModel = {
  async getBrands() {
    const sql = "SELECT id, name, logo_path FROM brands ORDER BY name ASC";
    const [rows] = await pool.query(sql);
    return rows.map((r) => ({
      ...r,
      logo_url: r.logo_path ? `${process.env.APP_URL}/${r.logo_path}` : null,
    }));
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

  async getServiceTypes() {
    const sql = "SELECT id, name FROM service_types ORDER BY name ASC";
    const [rows] = await pool.query(sql);
    return rows;
  },
};

module.exports = dataLoaderModel;
