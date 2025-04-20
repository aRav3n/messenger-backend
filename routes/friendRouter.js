const { Router } = require("express");
const controller = require("../controllers/friendController");
const router = Router();

const middleware = require("../controllers/middleware");

router.post("/", middleware.verify, controller.createFriend);
router.get("/:userName", controller.listFriends);
router.delete("/", middleware.verify, controller.deleteFriend);

module.exports = router;
