const pool = require('../config/database');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name FROM service_types ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar os tipos de serviço' });
  }
};