require("dotenv").config();

const db = require("../db/queries");
const security = require("./security");

async function createNewMessage(req, res) {
  const user = req.user.user;
  const senderId = user.id;
  const receiverId = Number(req.params.friendId);
  const friendship = await db.getFriendship(senderId, receiverId);
  const message = await db.addMessage(
    senderId,
    receiverId,
    friendship.id,
    req.body.message
  );

  return res.status(200).json(message);
}

async function deleteMessage(req, res) {
  const friendName = req.body.name;
  const user = req.user.user;
  const userName = user.name;

  return res.status(200).json();
}

async function listMessages(req, res) {
  return res.sendStatus(200);
}

module.exports = {
  createNewMessage,
  listMessages,
  deleteMessage,
};
