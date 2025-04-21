const { Router } = require("express");
const controller = require("../controllers/messageController");
const router = Router();

const middleware = require("../controllers/middleware");

router.post(
  "/:friendId",
  middleware.verify,
  middleware.checkIfFriendExists,
  controller.createNewMessage
);
router.get(
  "/friend/:friendId",
  middleware.verify,
  middleware.checkIfFriendExists,
  controller.listMessages
);
router.delete(
  "/:messageId",
  middleware.verify,
  middleware.checkIfMessageExists,
  controller.deleteMessage
);

module.exports = router;
