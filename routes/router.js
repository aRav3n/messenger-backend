const { Router } = require("express");
const controller = require("../controllers/controller");
const router = Router();

const security = require("../controllers/security");

router.post("/user/signup", controller.createUser);
router.post("/user/login", controller.logUserIn);
router.delete("/user/:userId/delete", security.verify, controller.deleteUser);

//router.get("/friend/:userId/", controller.listFriends);
/*
router.post("/friend/:userId/add", controller.createFriend);

router.get("/message/:userId/:messageId", controller.listSingleMessage);
router.post("/message/:userId/thread/:threadId", controller.createMessage);

router.get("/thread/:userId", controller.listThreads);
*/

router.use((req, res) => {
  console.log(`Request type: ${req.method}, URL: ${req.url}`);
  res.status(404).json({ error: "Route not found" });
});

router.use((err, req, res, next) => {
  console.log(`Request type: ${req.method}, URL: ${req.url}`);
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = router;
