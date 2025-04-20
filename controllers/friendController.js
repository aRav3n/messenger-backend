require("dotenv");

const db = require("../db/queries");
const security = require("./security");

async function createFriend(req, res) {
  const friendName = req.body.name;
  const friendObject = await db.listUserByName(friendName);

  if (!friendObject) {
    return res
      .status(404)
      .json({ message: `${friendName} was not found in the user database` });
  }
  const userObject = req.user.user;

  const newFriendship = await db.addFriend(userObject.id, friendObject.id);
  if (!newFriendship) {
    if (newFriendship === false) {
      return res.sendStatus(409);
    }
    return res.sendStatus(500);
  }

  return res
    .status(200)
    .json({ message: `New friendship with ${friendName} added!` });
}

async function deleteFriend(req, res) {
  const friendName = req.body.name;
  const user = req.user.user;
  const userName = user.name;

  const deletedFriendship = await db.deleteFriend(friendName, userName);
  if (!deletedFriendship || deletedFriendship.length === 0) {
    return res.status(404).json({
      message: `Sorry, a friendship between ${userName} and ${friendName} was not found`,
    });
  }
  return res.status(200).json(deletedFriendship);
}

async function listFriends(req, res) {
  const userName = req.params.userName;
  if (!userName) {
    return res.status(404).json({ message: "User name needed" });
  }
  const friendList = await db.listFriendsByUserName(userName);
  if (!friendList || friendList.length === 0) {
    return res
      .status(404)
      .json({ message: `No friendships found for user: ${userName}` });
  }
  return res.status(200).json(friendList);
}

module.exports = {
  createFriend,
  deleteFriend,
  listFriends,
};
