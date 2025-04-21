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
exports.listUserById = listUserById;
exports.listUserByName = listUserByName;
exports.addFriend = addFriend;
exports.getFriendship = getFriendship;
exports.deleteFriend = deleteFriend;
exports.listFriendsById = listFriendsById;
exports.countMessages = countMessages;
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
// internal use functions
function getUserAAndUserB(userId, friendId) {
    if (isNaN(userId) || isNaN(friendId)) {
        return null;
    }
    const userAId = Math.min(userId, friendId);
    const userBId = Math.max(userId, friendId);
    return { userAId, userBId };
}
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
        // delete the user's account
        const deletedUser = yield prisma.user.delete({
            where: { id },
        });
        return deletedUser;
    });
}
function listUserById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma.user.findFirst({
            where: { id },
        });
        return user;
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
function addFriend(userId, friendId) {
    return __awaiter(this, void 0, void 0, function* () {
        const ids = getUserAAndUserB(userId, friendId);
        if (!ids) {
            console.log("Invalid user IDs provided");
            return false; // Handle invalid input gracefully
        }
        try {
            const newFriendship = yield prisma.friendship.create({
                data: {
                    userAId: ids.userAId,
                    userBId: ids.userBId,
                },
            });
            return newFriendship;
        }
        catch (error) {
            if (error instanceof Error && "code" in error && error.code === "P2002") {
                return false;
            }
            console.error("Error adding friend:", error);
            throw error;
        }
    });
}
function getFriendship(userId, friendId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!userId || !friendId) {
            return null;
        }
        const ids = getUserAAndUserB(userId, friendId);
        if (!ids) {
            return null;
        }
        const friendship = yield prisma.friendship.findFirst({
            where: ids,
        });
        return friendship;
    });
}
function deleteFriend(friendshipId) {
    return __awaiter(this, void 0, void 0, function* () {
        const deletedFriendship = yield prisma.friendship.delete({
            where: {
                id: friendshipId,
            },
        });
        return deletedFriendship;
    });
}
function listFriendsById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const friendships = yield prisma.friendship.findMany({
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
            const nameToPush = friendships[i].userAId === id
                ? friendships[i].userB.name
                : friendships[i].userA.name;
            friendArray.push(nameToPush);
        }
        return friendArray;
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
