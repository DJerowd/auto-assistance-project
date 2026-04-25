const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.get("/unread-count", messageController.getUnreadCount);
router.get("/:friendId", messageController.getConversation);
router.patch("/:friendId/read", messageController.markAsRead);

module.exports = router;
