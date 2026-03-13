const express = require("express");
const router = express.Router();
const friendshipController = require("../controllers/friendshipController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.get("/", friendshipController.getFriends);
router.get("/search", friendshipController.searchUsers);
router.post("/request", friendshipController.sendRequest);
router.get("/requests", friendshipController.getPendingRequests);
router.put("/requests/:id", friendshipController.respondRequest);
router.delete("/:id", friendshipController.removeFriend);

module.exports = router;
