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
  const userAId = Math.min(userId, friendId);
  const userBId = Math.max(userId, friendId);
  return { userAId, userBId };
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
  // delete user's messages
  await prisma.message.deleteMany({
    where: {
      OR: [{ senderId: id }, { receiverId: id }],
    },
  });

  // delete user's message threads
  await prisma.thread.deleteMany({
    where: { userId: id },
  });

  // delete user's friendships
  await prisma.friendship.deleteMany({
    where: {
      OR: [{ userAId: id }, { userBId: id }],
    },
  });

  // finally delete the user's account
  const deletedUser = await prisma.user.delete({
    where: { id },
  });

  return deletedUser;
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
  try {
    const newFriendship = await prisma.friendship.create({
      data: ids,
    });
    return newFriendship;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return false;
    }
    console.error("Error adding friend:", error);
    throw error;
  }
}

async function countFriends(userId: number, friendId: number) {
  const ids = getUserAAndUserB(userId, friendId);
  const count = await prisma.friendship.count({
    where: ids,
  });

  return count;
}

async function deleteFriend(friendName: string, userName: string) {
  return prisma.$queryRaw`
    WITH user_ids AS (
      SELECT 
        (SELECT id FROM "User" WHERE name = ${userName}) AS user_id,
        (SELECT id FROM "User" WHERE name = ${friendName}) AS friend_id
    )
    DELETE FROM "Friendship"
    WHERE 
      ("userAId" = (SELECT user_id FROM user_ids) AND "userBId" = (SELECT friend_id FROM user_ids))
      OR
      ("userAId" = (SELECT friend_id FROM user_ids) AND "userBId" = (SELECT user_id FROM user_ids))
    RETURNING *;
  `;
}

async function listFriendsByUserName(name: string) {
  return prisma.$queryRaw`
    WITH target_user AS (
      SELECT id FROM "User" WHERE name = ${name}
    ),
    friend_ids AS (
      SELECT "userAId" AS friend_id 
      FROM "Friendship" 
      WHERE "userBId" = (SELECT id FROM target_user)
      UNION
      SELECT "userBId" AS friend_id 
      FROM "Friendship" 
      WHERE "userAId" = (SELECT id FROM target_user)
    )
    SELECT name 
    FROM "User" 
    WHERE id IN (SELECT friend_id FROM friend_ids)
    ORDER BY name ASC
  `;
}

// message queries
async function countMessages(id: number) {
  const count = await prisma.message.count({
    where: { id },
  });
  return count;
}

async function countThread(id: number) {
  const count = await prisma.message.count({
    where: { id },
  });
  return count;
}

export {
  // user queries
  addUser,
  deleteUser,
  listUserByName,

  // friend queries
  addFriend,
  countFriends,
  deleteFriend,
  listFriendsByUserName,

  // message queries
  countMessages,
  countThread,
};
