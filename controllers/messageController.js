require("dotenv").config();

const db = require("../db/queries");
const security = require("./security");

async function createMessageOnThread(req, res) {
  const friendName = req.body.name;
  const friendObject = await db.listUserByName(friendName);
}

async function createNewMessageAndThread(req, res) {
  const user = req.user.user;
  const senderId = user.id;
  const receiverId = Number(req.params.friendId);
  
}

async function deleteMessage(req, res) {
  const friendName = req.body.name;
  const user = req.user.user;
  const userName = user.name;

  return res.status(200).json();
}

async function deleteMessagesAndThread(req, res) {
  return;
}

async function listMessage(req, res) {
  return;
}

async function listThreadMessages(req, res) {
  return;
}

module.exports = {
  createMessageOnThread,
  createNewMessageAndThread,
  deleteMessage,
  deleteMessagesAndThread,
  listMessage,
  listThreadMessages,
};
