const db = require("../db/queries");
const security = require("./security");
const verify = security.verify;

async function checkIfFriendExists(req, res, next) {
  const userId = Number(req.user.user.id);

  const friendId = Number(req.params.friendId);
  if (isNaN(friendId)) {
    return res
      .status(400)
      .json({ message: "we need a friend ID to check that" });
  }

  const friend = await db.listUserById(friendId);
  if (!friend) {
    return res.status(404).json({ message: "that user wasn't found" });
  }

  const friendship = await db.getFriendship(userId, friendId);
  if (!friendship) {
    return res.status(404).json({ message: "that friend wasn't found" });
  }

  req.friendship = friendship;
  next();
}

async function checkIfMessageExists(req, res, next) {
  const id = Number(req.params.messageId);
  if (isNaN(id)) {
    return res.status(400).json({ message: "no message ID was provided" });
  }
  const count = await db.countMessages(id);
  if (count === 0) {
    return res.status(404).json({ message: "that message wasn't found" });
  }
  req.messageId = id;
  next();
}

async function checkIfUserExists(req, res, next) {
  const userId = Number(req.params.userId);
  if (isNaN(userId)) {
    return res.status(400).json({ message: "no user id provided" });
  }

  const user = await db.listUserById(userId);
  if (!user) {
    return res
      .status(400)
      .json({ message: `no user with an id of ${userId} found` });
  }

  req.user = user;
  next();
}

module.exports = {
  checkIfFriendExists,
  checkIfMessageExists,
  checkIfUserExists,
  verify,
};
