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
};

module.exports = vehicleImageModel;