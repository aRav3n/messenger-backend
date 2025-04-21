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

  const existingFriendship = await db.getFriendship(
    userObject.id,
    friendObject.id
  );

  if (existingFriendship) {
    return res
      .status(409)
      .json({ message: `a friendship with ${friendName} already exists` });
  }

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
  const friendship = req.friendship
    ? req.friendship
    : await (async () => {
        const user = req.user.user;
        const friend = await db.listUserByName(req.body.name);
        if (!friend) {
          return null;
        }
        const friendship = await db.getFriendship(user.id, friend.id);
        return friendship;
      })();

  const deletedFriendship = await db.deleteFriend(friendship.id);
  if (!deletedFriendship || deletedFriendship.length === 0) {
    return res.status(404).json({
      message: `Sorry, a friendship between ${userName} and ${friendName} was not found`,
    });
  }
  return res.status(200).json(deletedFriendship);
}

async function listFriends(req, res) {
  const userId = Number(req.params.userId);
  if (isNaN(userId)) {
    return res.status(404).json({ message: "User ID needed" });
  }
  const friendList = await db.listFriendsById(userId);
  if (!friendList || friendList.length === 0) {
    return res
      .status(404)
      .json({ message: `No friendships found for user with id of ${userId}` });
  }
  return res.status(200).json(friendList);
}

module.exports = {
  createFriend,
  deleteFriend,
  listFriends,
};
