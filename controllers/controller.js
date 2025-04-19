require("dotenv").config();

const { createUser, deleteUser, logUserIn } = require("./userController");
const {
  createFriend,
  deleteFriend,
  listFriends,
} = require("./friendController");

module.exports = {
  // friend exports
  createFriend,
  deleteFriend,
  listFriends,
  // user exports
  createUser,
  deleteUser,
  logUserIn,
};
