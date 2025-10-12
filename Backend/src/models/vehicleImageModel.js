const pool = require("../config/database");

const vehicleImageModel = {
  async hasPrimaryImage(vehicleId, connection = pool) {
    const sql = "SELECT 1 FROM vehicle_images WHERE vehicle_id = ? AND is_primary = 1 LIMIT 1";
    const [rows] = await connection.query(sql, [vehicleId]);
    return rows.length > 0;
  },

  async addImages(images, vehicleId, connection = pool) {
    const primaryExists = await this.hasPrimaryImage(vehicleId, connection);
    let isFirstImageInBatch = true;
    const values = images.map((img) => {
      let isPrimary = 0;
      if (!primaryExists && isFirstImageInBatch) {
        isPrimary = 1;
        isFirstImageInBatch = false;
      }
      return [vehicleId, img.path, isPrimary];
    });
    const sql = "INSERT INTO vehicle_images (vehicle_id, image_path, is_primary) VALUES ?";
    const [result] = await connection.query(sql, [values]);
    return result;
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

  async delete(imageId, connection = pool) {
    const sql = "DELETE FROM vehicle_images WHERE id = ?";
    const [result] = await connection.query(sql, [imageId]);
    return result.affectedRows;
  },

  async deleteByVehicleId(vehicleId, connection = pool) {
    const findSql = "SELECT id, image_path FROM vehicle_images WHERE vehicle_id = ?";
    const [images] = await connection.query(findSql, [vehicleId]);
    if (images.length === 0) {
        return { affectedRows: 0, images: [] };
    }
    const deleteSql = "DELETE FROM vehicle_images WHERE vehicle_id = ?";
    const [result] = await connection.query(deleteSql, [vehicleId]);
    return { affectedRows: result.affectedRows, images };
  },
};

module.exports = vehicleImageModel;