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
  // delete the user's account
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
  const friend = await listUserByName(friendName);
  const user = await listUserByName(userName);
  if (!friend || !user) {
    return null;
  }
  const count = await countFriends(friend.id, user.id);
  if (count === 0) {
    return null;
  }
  const ids = getUserAAndUserB(user.id, friend.id);
  const deletedFriendship = await prisma.friendship.delete({
    where: {
      userAId_userBId: ids,
    },
  });
  return deletedFriendship;
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
