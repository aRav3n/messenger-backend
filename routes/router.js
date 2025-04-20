const { Router } = require("express");
const router = Router();

const userRouter = require("./userRouter");
const friendRouter = require("./friendRouter");
const messageRouter = require("./messageRouter");

router.use("/user", userRouter);

router.use("/friend", friendRouter);

router.use("/message", messageRouter);

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
