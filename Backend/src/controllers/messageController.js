const messageModel = require("../models/messageModel");
const friendshipModel = require("../models/friendshipModel");

const messageController = {
  async getConversation(req, res, next) {
    try {
      const userId = req.user.userId;
      const friendId = req.params.friendId;
      const { page = 1, limit = 50 } = req.query;
      const areFriends = await friendshipModel.areFriends(userId, friendId);
      if (!areFriends) {
        const error = new Error(
          "Você não tem permissão para ver mensagens deste usuário.",
        );
        error.statusCode = 403;
        throw error;
      }
      const conversation = await messageModel.getConversation(
        userId,
        friendId,
        parseInt(page, 10),
        parseInt(limit, 10),
      );
      res.status(200).json(conversation);
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req, res, next) {
    try {
      const receiverId = req.user.userId;
      const senderId = req.params.friendId;
      await messageModel.markAsRead(senderId, receiverId);
      res.status(200).json({ message: "Mensagens marcadas como lidas." });
    } catch (error) {
      next(error);
    }
  },

  async getUnreadCount(req, res, next) {
    try {
      const count = await messageModel.getUnreadCount(req.user.userId);
      res.status(200).json({ unreadCount: count });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = messageController;
