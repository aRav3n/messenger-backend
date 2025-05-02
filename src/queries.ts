import { PrismaClient } from "../generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";
require("dotenv");

const databaseUrl =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_DATABASE_URL
    : process.env.NODE_ENV === "development"
      ? process.env.DEV_DATABASE_URL
      : process.env.DATABASE_URL;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
}).$extends(withAccelerate()); // need to fix this line after Emmet paste to put the money sign in front of extends

// internal use functions
function getUserAAndUserB(userId: number, friendId: number) {
  if (isNaN(userId) || isNaN(friendId)) {
    return null;
  }
  const userAId = Math.min(userId, friendId);
  const userBId = Math.max(userId, friendId);
  return { userAId, userBId };
}

// test only functions
async function deleteAllUsers() {
  await prisma.user.deleteMany({});
}

// user queries
async function addUser(name: string, hash: string) {
  const user = await prisma.user.create({
    data: {
      name,
      hash,
    },
  });

  return user;
}

async function deleteUser(id: number) {
  // delete the user's account
  const deletedUser = await prisma.user.delete({
    where: { id },
  });

  return deletedUser;
}

async function listUserById(id: number) {
  const user = await prisma.user.findFirst({
    where: { id },
  });
  return user;
}

async function listUserByName(name: string) {
  const userList = await prisma.user.findFirst({
    where: { name },
  });

  return userList;
}

// friend queries
async function addFriend(userId: number, friendId: number) {
  const ids = getUserAAndUserB(userId, friendId);
  if (!ids) {
    console.log("Invalid user IDs provided");
    return false; // Handle invalid input gracefully
  }

  try {
    const newFriendship = await prisma.friendship.create({
      data: {
        userAId: ids.userAId,
        userBId: ids.userBId,
      },
    });
    return newFriendship;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      return false;
    }
    console.error("Error adding friend:", error);
    throw error;
  }
}

async function getFriendship(userId: number, friendId: number) {
  if (!userId || !friendId) {
    return null;
  }
  const ids = getUserAAndUserB(userId, friendId);
  if (!ids) {
    return null;
  }
  const friendship = await prisma.friendship.findFirst({
    where: ids,
  });

  return friendship;
}

async function deleteFriend(friendshipId: number) {
  const deletedFriendship = await prisma.friendship.delete({
    where: {
      id: friendshipId,
    },
  });
  return deletedFriendship;
}

async function listFriendsById(id: number) {
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ userAId: id }, { userBId: id }],
    },
    include: {
      userA: { select: { id: true, name: true } },
      userB: { select: { id: true, name: true } },
    },
  });

  const friendArray = [];
  for (let i = 0; i < friendships.length; i++) {
    const userToPush =
      friendships[i].userAId === id
        ? { name: friendships[i].userB.name, id: friendships[i].userB.id }
        : { name: friendships[i].userA.name, id: friendships[i].userA.id };
    friendArray.push(userToPush);
  }

  return friendArray;
}

// message queries
async function addMessage(
  senderId: number,
  receiverId: number,
  friendshipId: number,
  messageBody: string
) {
  const dbMessage = await prisma.message.create({
    data: {
      senderId,
      receiverId,
      friendshipId,
      messageBody,
    },
  });

  return dbMessage;
}

async function countMessages(id: number) {
  const count = await prisma.message.count({
    where: { id },
  });
  return count;
}

async function deleteMessage(id: number) {
  const deletedMessage = await prisma.message.delete({
    where: { id },
  });
  return deletedMessage;
}

async function listMessages(friendshipId: number) {
  const messages = await prisma.message.findMany({
    where: { friendshipId },
  });
  return messages;
}

export {
  // test queries
  deleteAllUsers,

  // user queries
  addUser,
  deleteUser,
  listUserById,
  listUserByName,

  // friend queries
  addFriend,
  getFriendship,
  deleteFriend,
  listFriendsById,

  // message queries
  addMessage,
  countMessages,
  deleteMessage,
  listMessages,
};
