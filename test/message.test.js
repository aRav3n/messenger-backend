const router = require("../routes/router");

const request = require("supertest");
const express = require("express");
const app = express();
require("dotenv");

const db = require("../db/queries");

app.use(express.urlencoded({ extended: false }));
app.use("/", router);

const password = "123456";
const firstFriend = { name: "Message Test User 1", password };
const secondFriend = { name: "Message Test User 2", password };
const wrongId = 0;
const message = {
  to: secondFriend.name,
  message: "Hi there, this is a message!",
};
let badToken;
let messageResponse;

// create two users
beforeAll(async () => {
  async function createUserAccount(userObject) {
    const res = await request(app)
      .post("/user/signup")
      .type("form")
      .send({ confirmPassword: password, ...userObject });
    const user = res.body;
    userObject.id = user.id;
  }

  async function logUserIn(userObject) {
    await createUserAccount(userObject);
    const res = await request(app)
      .post("/user/login")
      .type("form")
      .send(userObject)
      .expect(200);
    userObject.token = await res.body.token;
  }

  async function createFriendship(user, friend) {
    await request(app)
      .post("/friend")
      .set("Authorization", `Bearer ${user.token}`)
      .type("form")
      .send({ name: friend.name })
      .expect(200)
      .expect("Content-Type", /json/)
      .expect({ message: `New friendship with ${friend.name} added!` });
  }

  await logUserIn(firstFriend);
  await logUserIn(secondFriend);
  badToken = firstFriend.token ? firstFriend.token.slice(0, -1) : null;
  await createFriendship(firstFriend, secondFriend);
});

// delete firstFriend and secondFriend
afterAll(async () => {
  firstFriend.id ? await db.deleteUser(firstFriend.id) : null;
  secondFriend.id ? await db.deleteUser(secondFriend.id) : null;
  firstFriend.id = null;
  firstFriend.token = null;
  secondFriend.id = null;
  secondFriend.token = null;
});

// test creating a message on an existing friendship
test("Create message on a friendship fails when not signed in", (done) => {
  request(app)
    .post(`/message/${wrongId}`)
    .expect(401)
    .expect("Content-Type", /json/)
    .expect({ message: "you have to be logged in to do that" }, done);
});

test("Create message on a friendship fails when token has been altered", (done) => {
  request(app)
    .post(`/message/${wrongId}`)
    .set("Authorization", `Bearer ${badToken}`)
    .expect(403)
    .expect("Content-Type", /json/)
    .expect(
      { message: "there was an error with your login, please sign in again" },
      done
    );
});

test("Create message on a friendship fails when friendship doesn't exist", (done) => {
  request(app)
    .post(`/message/${wrongId}`)
    .set("Authorization", `Bearer ${firstFriend.token}`)
    .expect(404)
    .expect("Content-Type", /json/)
    .expect({ message: "that user wasn't found" }, done);
});

test("Create message works", (done) => {
  request(app)
    .post(`/message/${secondFriend.id}`)
    .set("Authorization", `Bearer ${firstFriend.token}`)
    .type("form")
    .send(message)
    .expect(200)
    .then((res) => {
      expect(res.body.senderId).toBe(firstFriend.id);
      expect(res.body.receiverId).toBe(secondFriend.id);
      expect(res.body.messageBody).toBe(message.message);
      messageResponse = res.body;
      done();
    });
});

// test list an existing friendship
test("List messages fails when not signed in", (done) => {
  request(app)
    .get(`/message/friend/${wrongId}`)
    .expect(401)
    .expect("Content-Type", /json/)
    .expect({ message: "you have to be logged in to do that" }, done);
});

test("List messages fails when token has been altered", (done) => {
  request(app)
    .get(`/message/friend/${wrongId}`)
    .set("Authorization", `Bearer ${badToken}`)
    .expect(403)
    .expect("Content-Type", /json/)
    .expect(
      { message: "there was an error with your login, please sign in again" },
      done
    );
});

test("List messages fails when friendship doesn't exist", (done) => {
  request(app)
    .get(`/message/friend/${wrongId}`)
    .set("Authorization", `Bearer ${firstFriend.token}`)
    .expect(404)
    .expect("Content-Type", /json/)
    .expect({ message: "that user wasn't found" }, done);
});

test("List messages works", (done) => {
  request(app)
    .get(`/message/friend/${secondFriend.id}`)
    .set("Authorization", `Bearer ${firstFriend.token}`)
    .expect(200)
    .then((res) => {
      expect(res.body[0].senderId).toBe(firstFriend.id);
      expect(res.body[0].receiverId).toBe(secondFriend.id);
      expect(res.body[0].messageBody).toBe(message.message);
      done();
    });
});

// test delete an existing message
test("Delete message fails when not signed in", (done) => {
  request(app)
    .delete(`/message/${wrongId}`)
    .type("form")
    .send(message)
    .expect(401)
    .expect("Content-Type", /json/)
    .expect({ message: "you have to be logged in to do that" }, done);
});

test("Delete message fails when token has been altered", (done) => {
  const token = firstFriend.token.slice(0, -1);
  request(app)
    .delete(`/message/${wrongId}`)
    .set("Authorization", `Bearer ${badToken}`)
    .type("form")
    .send(message)
    .expect(403)
    .expect("Content-Type", /json/)
    .expect(
      { message: "there was an error with your login, please sign in again" },
      done
    );
});

test("Delete message fails when message doesn't exist", (done) => {
  request(app)
    .delete(`/message/${wrongId}`)
    .set("Authorization", `Bearer ${firstFriend.token}`)
    .type("form")
    .send(message)
    .expect(404)
    .expect("Content-Type", /json/)
    .expect({ message: "that message wasn't found" }, done);
});

test("Delete message works", async () => {
  const res = await request(app)
    .delete(`/message/${messageResponse.id}`)
    .set("Authorization", `Bearer ${firstFriend.token}`)
    .expect(200);

  expect(res.body.senderId).toBe(firstFriend.id);
  expect(res.body.receiverId).toBe(secondFriend.id);
  expect(res.body.messageBody).toBe(message.message);
});
