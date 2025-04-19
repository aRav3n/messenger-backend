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

export { addUser, deleteUser, listUserByName };
