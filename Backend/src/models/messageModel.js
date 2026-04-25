const pool = require("../config/database");

const messageModel = {
  async create(messageData, connection = pool) {
    const { sender_id, receiver_id, content, attachment_type, attachment_id } =
      messageData;
    const sql = `
      INSERT INTO messages (sender_id, receiver_id, content, attachment_type, attachment_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await connection.query(sql, [
      sender_id,
      receiver_id,
      content || null,
      attachment_type || null,
      attachment_id || null,
    ]);
    return result.insertId;
  },

  async findById(messageId, connection = pool) {
    const sql = `SELECT * FROM messages WHERE id = ?`;
    const [rows] = await connection.query(sql, [messageId]);
    return rows[0];
  },

  async getConversation(userId1, userId2, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const countSql = `
      SELECT COUNT(*) as total FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) 
         OR (sender_id = ? AND receiver_id = ?)
    `;
    const [countResult] = await pool.query(countSql, [
      userId1,
      userId2,
      userId2,
      userId1,
    ]);
    const totalItems = countResult[0].total;
    const dataSql = `
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) 
         OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [messages] = await pool.query(dataSql, [
      userId1,
      userId2,
      userId2,
      userId1,
      limit,
      offset,
    ]);
    return {
      data: messages,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit,
      },
    };
  },

  async markAsRead(senderId, receiverId) {
    const sql = `
      UPDATE messages 
      SET is_read = TRUE 
      WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE
    `;
    const [result] = await pool.query(sql, [senderId, receiverId]);
    return result.affectedRows;
  },

  async getUnreadCount(userId) {
    const sql = `SELECT COUNT(*) as unread_count FROM messages WHERE receiver_id = ? AND is_read = FALSE`;
    const [result] = await pool.query(sql, [userId]);
    return result[0].unread_count;
  },
};

module.exports = messageModel;
