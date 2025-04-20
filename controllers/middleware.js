const db = require("../db/queries");
const security = require("./security");
const verify = security.verify;

async function checkIfFriendExists(req, res, next) {
  const userId = Number(req.user.user.id);
  const friendId = req.params.friendId;
  const count = await db.countFriends(userId, friendId);
  if (count === 0) {
    return res.status(404).json({ message: "that friend wasn't found" });
  }
  next();
}

async function checkIfMessageExists(req, res, next) {
  const id = Number(req.params.messageId);
  const count = await db.countMessages(id);
  if (count === 0) {
    return res.status(404).json({ message: "that message wasn't found" });
  }
  next();
}

module.exports = {
  checkIfFriendExists,
  checkIfMessageExists,
  verify,
};
