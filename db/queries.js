"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addUser = addUser;
exports.deleteUser = deleteUser;
exports.listUserByName = listUserByName;
exports.addFriend = addFriend;
exports.countFriends = countFriends;
exports.deleteFriend = deleteFriend;
exports.listFriendsByUserName = listFriendsByUserName;
exports.countMessages = countMessages;
exports.countThread = countThread;
const prisma_1 = require("../generated/prisma");
const extension_accelerate_1 = require("@prisma/extension-accelerate");
require("dotenv");
const databaseUrl = process.env.NODE_ENV === "test"
    ? process.env.TEST_DATABASE_URL
    : process.env.NODE_ENV === "development"
        ? process.env.DEV_DATABASE_URL
        : process.env.DATABASE_URL;
const prisma = new prisma_1.PrismaClient({
    datasources: {
        db: {
            url: databaseUrl,
        },
    },
}).$extends((0, extension_accelerate_1.withAccelerate)()); // need to fix this line after Emmet paste to put the money sign in front of extends
// user queries
function addUser(name, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma.user.create({
            data: {
                name,
                hash,
            },
        });
        return user;
    });
}
function deleteUser(id) {
    return __awaiter(this, void 0, void 0, function* () {
        // delete user's messages
        yield prisma.message.deleteMany({
            where: {
                OR: [{ senderId: id }, { receiverId: id }],
            },
        });
        // delete user's message threads
        yield prisma.thread.deleteMany({
            where: { userId: id },
        });
        // delete user's friendships
        yield prisma.friendship.deleteMany({
            where: {
                OR: [{ userAId: id }, { userBId: id }],
            },
        });
        // finally delete the user's account
        const deletedUser = yield prisma.user.delete({
            where: { id },
        });
        return deletedUser;
    });
}
function listUserByName(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const userList = yield prisma.user.findFirst({
            where: { name },
        });
        return userList;
    });
}
// friend queries
function getUserAAndUserB(userId, friendId) {
    const userAId = Math.min(userId, friendId);
    const userBId = Math.max(userId, friendId);
    return { userAId, userBId };
}
function addFriend(userId, friendId) {
    return __awaiter(this, void 0, void 0, function* () {
        const ids = getUserAAndUserB(userId, friendId);
        try {
            const newFriendship = yield prisma.friendship.create({
                data: ids,
            });
            return newFriendship;
        }
        catch (error) {
            if (error &&
                typeof error === "object" &&
                "code" in error &&
                error.code === "P2002") {
                return false;
            }
            console.error("Error adding friend:", error);
            throw error;
        }
    });
}
function countFriends(userId, friendId) {
    return __awaiter(this, void 0, void 0, function* () {
        const ids = getUserAAndUserB(userId, friendId);
        const count = yield prisma.friendship.count({
            where: ids,
        });
        return count;
    });
}
function deleteFriend(friendName, userName) {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma.$queryRaw `
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
    });
}
function listFriendsByUserName(name) {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma.$queryRaw `
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
    });
}
// message queries
function countMessages(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const count = yield prisma.message.count({
            where: { id },
        });
        return count;
    });
}
function countThread(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const count = yield prisma.message.count({
            where: { id },
        });
        return count;
    });
}
