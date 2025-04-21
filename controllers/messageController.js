require("dotenv").config();

const db = require("../db/queries");

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
  const message = await db.deleteMessage(Number(req.messageId));

  return res.status(200).json(message);
}

async function listMessages(req, res) {
  const friendship = req.friendship;
  const messages = await db.listMessages(friendship.id);

  return res.status(200).json(messages);
}

module.exports = {
  createNewMessage,
  listMessages,
  deleteMessage,
};
