const { Router } = require("express");
const controller = require("../controllers/userController");
const router = Router();

const middleware = require("../controllers/middleware");

router.post("/signup", controller.createUser);
router.post("/login", controller.logUserIn);
router.delete("/:userId/delete", middleware.verify, controller.deleteUser);

module.exports = router;
