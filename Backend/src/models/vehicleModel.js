const pool = require("../config/database");

const vehicleModel = {
  async create(vehicleData, userId, connection = pool) {
    const {
      brand_id,
      color_id,
      license_plate,
      model,
      version,
      year_of_manufacture,
      year_model,
      current_mileage,
      nickname,
    } = vehicleData;
    const sql = `
      INSERT INTO vehicles (user_id, brand_id, color_id, license_plate, model, version, year_of_manufacture, year_model, current_mileage, nickname)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await connection.query(sql, [
      userId,
      brand_id,
      color_id,
      license_plate,
      model,
      version,
      year_of_manufacture,
      year_model,
      current_mileage,
      nickname,
    ]);
    return {
      id: result.insertId,
      ...vehicleData,
      user_id: userId,
      is_favorite: 0,
    };
  },

  async findByUserId(userId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = "created_at",
      order = "DESC",
      model = null,
      favoritesOnly = false,
    } = options;
    const offset = (page - 1) * limit;
    const allowedSortBy = [
      "id",
      "model",
      "year_model",
      "current_mileage",
      "created_at",
      "is_favorite",
    ];
    const safeSortBy = allowedSortBy.includes(sortBy) ? sortBy : "created_at";
    const safeOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

    let countSql = `SELECT COUNT(*) as total FROM vehicles WHERE user_id = ?`;
    const params = [userId];

    if (model) {
      countSql += ` AND model LIKE ?`;
      params.push(`%${model}%`);
    }
    if (favoritesOnly) {
      countSql += ` AND is_favorite = 1`;
    }

    const [countResult] = await pool.query(countSql, params);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    let dataSql = `
      SELECT v.*, b.name as brand_name, c.name as color_name
      FROM vehicles v
      LEFT JOIN brands b ON v.brand_id = b.id
      LEFT JOIN colors c ON v.color_id = c.id
      WHERE v.user_id = ?
    `;

    if (model) {
      dataSql += ` AND v.model LIKE ?`;
    }
    if (favoritesOnly) {
      dataSql += ` AND v.is_favorite = 1`;
    }

    if (safeSortBy === "created_at") {
      dataSql += ` ORDER BY v.is_favorite DESC, v.${safeSortBy} ${safeOrder} LIMIT ? OFFSET ?`;
    } else {
      dataSql += ` ORDER BY v.${safeSortBy} ${safeOrder} LIMIT ? OFFSET ?`;
    }

    params.push(limit, offset);
    const [vehicles] = await pool.query(dataSql, params);
    for (const vehicle of vehicles) {
      const imagesSql =
        "SELECT id, image_path, is_primary FROM vehicle_images WHERE vehicle_id = ?";
      const [images] = await pool.query(imagesSql, [vehicle.id]);
      vehicle.images = images.map((img) => ({
        ...img,
        url: `${process.env.APP_URL}/${img.image_path.replace(/\\/g, "/")}`,
      }));
      vehicle.is_favorite = Boolean(vehicle.is_favorite);
    }
    return {
      data: vehicles,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  },

  async findById(vehicleId) {
    const vehicleSql = `
      SELECT v.*, b.name as brand_name, c.name as color_name
      FROM vehicles v
      LEFT JOIN brands b ON v.brand_id = b.id
      LEFT JOIN colors c ON v.color_id = c.id
      WHERE v.id = ?
    `;
    const [rows] = await pool.query(vehicleSql, [vehicleId]);
    const vehicle = rows[0];
    if (vehicle) {
      const imagesSql =
        "SELECT id, image_path, is_primary FROM vehicle_images WHERE vehicle_id = ?";
      const [images] = await pool.query(imagesSql, [vehicleId]);
      vehicle.images = images.map((img) => ({
        ...img,
        url: `${process.env.APP_URL}/${img.image_path.replace(/\\/g, "/")}`,
      }));
      vehicle.is_favorite = Boolean(vehicle.is_favorite);
    }
    return vehicle;
  },

  async update(vehicleId, vehicleData, connection = pool) {
    const {
      brand_id,
      color_id,
      license_plate,
      model,
      version,
      year_of_manufacture,
      year_model,
      current_mileage,
      nickname,
    } = vehicleData;
    const sql = `
      UPDATE vehicles
      SET brand_id = ?, color_id = ?, license_plate = ?, model = ?, version = ?, year_of_manufacture = ?, year_model = ?, current_mileage = ?, nickname = ?
      WHERE id = ?
    `;
    const [result] = await connection.query(sql, [
      brand_id,
      color_id,
      license_plate,
      model,
      version,
      year_of_manufacture,
      year_model,
      current_mileage,
      nickname,
      vehicleId,
    ]);
    return result.affectedRows;
  },

  async toggleFavorite(vehicleId, connection = pool) {
    const sql = `UPDATE vehicles SET is_favorite = NOT is_favorite WHERE id = ?`;
    const [result] = await connection.query(sql, [vehicleId]);
    return result.affectedRows;
  },

  async delete(vehicleId, connection = pool) {
    const sql = "DELETE FROM vehicles WHERE id = ?";
    const [result] = await connection.query(sql, [vehicleId]);
    return result.affectedRows;
  },
};

module.exports = vehicleModel;
