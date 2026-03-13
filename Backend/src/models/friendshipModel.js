const pool = require("../config/database");

const friendshipModel = {
  async create(requesterId, friendEmail) {
    const [users] = await pool.query("SELECT id FROM users WHERE email = ?", [
      friendEmail,
    ]);
    if (users.length === 0) {
      throw new Error("Usuário não encontrado.");
    }
    const addresseeId = users[0].id;

    if (requesterId === addresseeId) {
      throw new Error("Você não pode adicionar a si mesmo.");
    }

    const [existing] = await pool.query(
      "SELECT * FROM friendships WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)",
      [requesterId, addresseeId, addresseeId, requesterId],
    );

    if (existing.length > 0) {
      if (existing[0].status === "ACCEPTED")
        throw new Error("Vocês já são amigos.");
      if (existing[0].status === "PENDING")
        throw new Error("Já existe uma solicitação pendente.");
    }

    const sql =
      "INSERT INTO friendships (requester_id, addressee_id) VALUES (?, ?)";
    const [result] = await pool.query(sql, [requesterId, addresseeId]);
    return result.insertId;
  },

  async updateStatus(id, status) {
    const sql = "UPDATE friendships SET status = ? WHERE id = ?";
    const [result] = await pool.query(sql, [status, id]);
    return result.affectedRows;
  },

  async delete(id) {
    const sql = "DELETE FROM friendships WHERE id = ?";
    const [result] = await pool.query(sql, [id]);
    return result.affectedRows;
  },

  async findFriends(userId) {
    const sql = `
      SELECT 
        f.id as friendship_id,
        u.id as user_id, 
        u.name, 
        u.email, 
        u.profile_image 
      FROM friendships f
      JOIN users u ON (u.id = f.requester_id OR u.id = f.addressee_id)
      WHERE (f.requester_id = ? OR f.addressee_id = ?)
      AND f.status = 'ACCEPTED'
      AND u.id != ?
    `;
    const [rows] = await pool.query(sql, [userId, userId, userId]);
    return rows.map((user) => ({
      ...user,
      profile_image: user.profile_image
        ? `${process.env.APP_URL}/${user.profile_image}`
        : null,
    }));
  },

  async searchPotentialFriends(userId, query) {
    const searchTerm = `%${query}%`;
    const sql = `
      SELECT id as user_id, name, email, profile_image
      FROM users
      WHERE (name LIKE ? OR email LIKE ?)
      AND id != ?
      AND id NOT IN (
          SELECT addressee_id FROM friendships WHERE requester_id = ?
          UNION
          SELECT requester_id FROM friendships WHERE addressee_id = ?
      )
      LIMIT 5
    `;
    const [rows] = await pool.query(sql, [
      searchTerm,
      searchTerm,
      userId,
      userId,
      userId,
    ]);
    return rows.map((user) => ({
      ...user,
      profile_image: user.profile_image
        ? `${process.env.APP_URL}/${user.profile_image}`
        : null,
    }));
  },

  async findPendingRequests(userId) {
    const sql = `
      SELECT 
        f.id as friendship_id, 
        u.id as requester_id, 
        u.name, 
        u.email, 
        u.profile_image
      FROM friendships f
      JOIN users u ON u.id = f.requester_id
      WHERE f.addressee_id = ? AND f.status = 'PENDING'
    `;
    const [rows] = await pool.query(sql, [userId]);
    return rows.map((user) => ({
      ...user,
      profile_image: user.profile_image
        ? `${process.env.APP_URL}/${user.profile_image}`
        : null,
    }));
  },

  async areFriends(user1Id, user2Id) {
    const sql = `
      SELECT id FROM friendships 
      WHERE ((requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?))
      AND status = 'ACCEPTED'
    `;
    const [rows] = await pool.query(sql, [user1Id, user2Id, user2Id, user1Id]);
    return rows.length > 0;
  },
};

module.exports = friendshipModel;
