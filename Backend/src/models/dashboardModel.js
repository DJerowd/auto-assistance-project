const pool = require("../config/database");

const dashboardModel = {
  async getStatsByUserId(userId) {
    // 1. Contar o total de veículos do usuário
    const totalVehiclesSql =
      "SELECT COUNT(*) as total FROM vehicles WHERE user_id = ?";
    const [vehiclesResult] = await pool.query(totalVehiclesSql, [userId]);
    const totalVehicles = vehiclesResult[0].total;

    // 2. Contar o total de lembretes pendentes
    const pendingRemindersSql = `
      SELECT COUNT(*) as total 
      FROM reminders r
      JOIN vehicles v ON r.vehicle_id = v.id
      WHERE v.user_id = ? AND r.status = 'PENDING'
    `;
    const [remindersResult] = await pool.query(pendingRemindersSql, [userId]);
    const pendingReminders = remindersResult[0].total;

    // 3. Somar o custo total de manutenções no último ano
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const year = oneYearAgo.getFullYear();
    const month = String(oneYearAgo.getMonth() + 1).padStart(2, '0');
    const day = String(oneYearAgo.getDate()).padStart(2, '0');
    const yearAgoDate = `${year}-${month}-${day}`;
    const totalCostSql = `
    SELECT SUM(m.cost) as total
    FROM maintenances m
    JOIN vehicles v ON m.vehicle_id = v.id
    WHERE v.user_id = ? AND m.maintenance_date >= ?
    `;
    const [costResult] = await pool.query(totalCostSql, [userId, yearAgoDate]);
    const totalCostLastYear = costResult[0].total || 0;

    // 4. Buscar o próximo lembrete pendente (o mais próximo no futuro)
    const nextReminderSql = `
      SELECT r.* FROM reminders r
      JOIN vehicles v ON r.vehicle_id = v.id
      WHERE v.user_id = ? AND r.status = 'PENDING' AND r.date_threshold >= CURDATE()
      ORDER BY r.date_threshold ASC
      LIMIT 1
    `;
    const [nextReminderResult] = await pool.query(nextReminderSql, [userId]);
    const nextReminder = nextReminderResult[0] || null;

    return {
      totalVehicles,
      pendingReminders,
      totalCostLastYear: parseFloat(totalCostLastYear),
      nextReminder,
    };
  },
};

module.exports = dashboardModel;