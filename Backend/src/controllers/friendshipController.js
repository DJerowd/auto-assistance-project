const friendshipModel = require("../models/friendshipModel");

const friendshipController = {
  async sendRequest(req, res, next) {
    try {
      const requesterId = req.user.userId;
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });

      await friendshipModel.create(requesterId, email);
      res.status(201).json({ message: "Friend request sent." });
    } catch (error) {
      next(error);
    }
  },

  async searchUsers(req, res, next) {
    try {
      const userId = req.user.userId;
      const { q } = req.query;
      if (!q || q.length < 2) {
        return res.status(200).json([]);
      }
      const users = await friendshipModel.searchPotentialFriends(userId, q);
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  },

  async respondRequest(req, res, next) {
    try {
      const { id } = req.params;
      const { action } = req.body;

      if (action === "ACCEPT") {
        await friendshipModel.updateStatus(id, "ACCEPTED");
        res.status(200).json({ message: "Friend request accepted." });
      } else if (action === "REJECT") {
        await friendshipModel.delete(id);
        res.status(200).json({ message: "Friend request rejected." });
      } else {
        res.status(400).json({ message: "Invalid action." });
      }
    } catch (error) {
      next(error);
    }
  },

  async removeFriend(req, res, next) {
    try {
      const { id } = req.params;
      await friendshipModel.delete(id);
      res.status(200).json({ message: "Friend removed." });
    } catch (error) {
      next(error);
    }
  },

  async getFriends(req, res, next) {
    try {
      const userId = req.user.userId;
      const friends = await friendshipModel.findFriends(userId);
      res.status(200).json(friends);
    } catch (error) {
      next(error);
    }
  },

  async getPendingRequests(req, res, next) {
    try {
      const userId = req.user.userId;
      const requests = await friendshipModel.findPendingRequests(userId);
      res.status(200).json(requests);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = friendshipController;
