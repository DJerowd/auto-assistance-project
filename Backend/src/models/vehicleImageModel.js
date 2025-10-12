const pool = require("../config/database");

const vehicleImageModel = {
  async addImages(images, vehicleId) {
    const sql = "INSERT INTO vehicle_images (vehicle_id, image_path) VALUES ?";
    const values = images.map((img) => [vehicleId, img.path]);
    const [result] = await pool.query(sql, [values]);
    return result;
  },

  async delete(imageId) {
    const sql = "DELETE FROM vehicle_images WHERE id = ?";
    const [result] = await pool.query(sql, [imageId]);
    return result.affectedRows;
  },

  async findById(imageId) {
    const sql = "SELECT * FROM vehicle_images WHERE id = ?";
    const [rows] = await pool.query(sql, [imageId]);
    return rows[0];
  },

  async setAsPrimary(imageId, vehicleId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const resetSql =
        "UPDATE vehicle_images SET is_primary = FALSE WHERE vehicle_id = ?";
      await connection.query(resetSql, [vehicleId]);
      const setSql =
        "UPDATE vehicle_images SET is_primary = TRUE WHERE id = ? AND vehicle_id = ?";
      await connection.query(setSql, [imageId, vehicleId]);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
};

module.exports = vehicleImageModel;