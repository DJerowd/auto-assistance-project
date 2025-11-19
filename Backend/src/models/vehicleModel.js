const pool = require("../config/database");

const vehicleModel = {
  async _getVehicleFeatures(vehicleId, connection = pool) {
    const sql = `
      SELECT f.id, f.name 
      FROM features f
      JOIN vehicle_features vf ON f.id = vf.feature_id
      WHERE vf.vehicle_id = ?
    `;
    const [rows] = await connection.query(sql, [vehicleId]);
    return rows;
  },

  async _saveVehicleFeatures(vehicleId, featureIds, connection) {
    await connection.query(
      "DELETE FROM vehicle_features WHERE vehicle_id = ?",
      [vehicleId]
    );
    if (featureIds && featureIds.length > 0) {
      const values = featureIds.map((fid) => [vehicleId, fid]);
      await connection.query(
        "INSERT INTO vehicle_features (vehicle_id, feature_id) VALUES ?",
        [values]
      );
    }
  },

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
      features,
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
    const vehicleId = result.insertId;
    if (features && Array.isArray(features)) {
      await this._saveVehicleFeatures(vehicleId, features, connection);
    }
    return {
      id: vehicleId,
      ...vehicleData,
      user_id: userId,
      is_favorite: 0,
      has_pending_reminders: false,
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
      brandId = null,
      minYear = null,
      maxYear = null,
      pendingReminders = false,
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

    let countSql = `SELECT COUNT(*) as total FROM vehicles v WHERE v.user_id = ?`;
    const params = [userId];

    if (model) {
      countSql += ` AND v.model LIKE ?`;
      params.push(`%${model}%`);
    }
    if (favoritesOnly) {
      countSql += ` AND v.is_favorite = 1`;
    }
    if (brandId) {
      countSql += ` AND v.brand_id = ?`;
      params.push(brandId);
    }
    if (minYear) {
      countSql += ` AND v.year_model >= ?`;
      params.push(minYear);
    }
    if (maxYear) {
      countSql += ` AND v.year_model <= ?`;
      params.push(maxYear);
    }
    if (pendingReminders) {
      countSql += ` AND EXISTS (SELECT 1 FROM reminders r WHERE r.vehicle_id = v.id AND r.status = 'PENDING')`;
    }

    const [countResult] = await pool.query(countSql, params);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    let dataSql = `
      SELECT v.*, b.name as brand_name, c.name as color_name,
      (SELECT COUNT(*) FROM reminders r WHERE r.vehicle_id = v.id AND r.status = 'PENDING') > 0 as has_pending_reminders
      FROM vehicles v
      LEFT JOIN brands b ON v.brand_id = b.id
      LEFT JOIN colors c ON v.color_id = c.id
      WHERE v.user_id = ?
    `;

    if (model) dataSql += ` AND v.model LIKE ?`;
    if (favoritesOnly) dataSql += ` AND v.is_favorite = 1`;
    if (brandId) dataSql += ` AND v.brand_id = ?`;
    if (minYear) dataSql += ` AND v.year_model >= ?`;
    if (maxYear) dataSql += ` AND v.year_model <= ?`;
    if (pendingReminders) {
      dataSql += ` AND EXISTS (SELECT 1 FROM reminders r WHERE r.vehicle_id = v.id AND r.status = 'PENDING')`;
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
      vehicle.has_pending_reminders = Boolean(vehicle.has_pending_reminders);
      vehicle.features = await this._getVehicleFeatures(vehicle.id, pool);
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

  async getUserFilterOptions(userId) {
    const brandsSql = `
      SELECT DISTINCT b.id, b.name
      FROM vehicles v
      JOIN brands b ON v.brand_id = b.id
      WHERE v.user_id = ?
      ORDER BY b.name ASC
    `;

    const yearsSql = `
      SELECT MIN(year_model) as minYear, MAX(year_model) as maxYear
      FROM vehicles
      WHERE user_id = ?
    `;

    const [brands] = await pool.query(brandsSql, [userId]);
    const [years] = await pool.query(yearsSql, [userId]);

    return {
      brands,
      minYear: years[0].minYear,
      maxYear: years[0].maxYear,
    };
  },

  async findById(vehicleId) {
    const vehicleSql = `
      SELECT v.*, b.name as brand_name, c.name as color_name,
      (SELECT COUNT(*) FROM reminders r WHERE r.vehicle_id = v.id AND r.status = 'PENDING') > 0 as has_pending_reminders
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
      vehicle.has_pending_reminders = Boolean(vehicle.has_pending_reminders);
      vehicle.features = await this._getVehicleFeatures(vehicleId, pool);
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
      features,
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
    if (features && Array.isArray(features)) {
      await this._saveVehicleFeatures(vehicleId, features, connection);
    }
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
