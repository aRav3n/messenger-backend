const { Router } = require("express");
const controller = require("../controllers/messageController");
const router = Router();

const middleware = require("../controllers/middleware");

router.post(
  "/thread/:threadId",
  middleware.verify,
  middleware.checkIfThreadExists,
  controller.createMessageOnThread
);
router.get(
  "/thread/:threadId",
  middleware.verify,
  middleware.checkIfThreadExists,
  controller.listThreadMessages
);
router.delete(
  "/thread/:threadId",
  middleware.verify,
  middleware.checkIfThreadExists,
  controller.deleteMessagesAndThread
);

router.post(
  "/:friendId",
  middleware.verify,
  middleware.checkIfFriendExists,
  controller.createNewMessageAndThread
);
router.get(
  "/:messageId",
  middleware.verify,
  middleware.checkIfMessageExists,
  controller.listMessage
);
router.delete(
  "/:messageId",
  middleware.verify,
  middleware.checkIfMessageExists,
  controller.deleteMessage
);

module.exports = router;
