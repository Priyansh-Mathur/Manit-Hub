const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const friendsController = require("../controllers/friends.controller");

router.get("/", auth, friendsController.getFriends);
router.get("/requests", auth, friendsController.getRequests);
router.post("/requests/:userId", auth, friendsController.sendRequest);
router.patch("/requests/:userId/accept", auth, friendsController.acceptRequest);
router.delete("/requests/:userId", auth, friendsController.removeRequest);
router.delete("/:userId", auth, friendsController.unfriend);

module.exports = router;
