const { Router } = require("express");
const controller = require("../controllers/friendController");
const router = Router();

const middleware = require("../controllers/middleware");

router.post("/", middleware.verify, controller.createFriend);
router.get("/:userId", middleware.checkIfUserExists, controller.listFriends);
router.delete(
  "/:friendId",
  middleware.verify,
  middleware.checkIfFriendExists,
  controller.deleteFriend
);

module.exports = router;
