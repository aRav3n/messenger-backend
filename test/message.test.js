const router = require("../routes/router");

const request = require("supertest");
const express = require("express");
const app = express();
require("dotenv");

const security = require("../controllers/security");

app.use(express.urlencoded({ extended: false }));
app.use("/", router);

const password = "123456";
const firstFriend = { name: "User 1", password };
const secondFriend = { name: "User 2", password };
const wrongName = "Maximus Decimus Meridius";
const wrongId = 0;
const message = {
  to: secondFriend.name,
  message: "Hi there, this is a message!",
};
let badToken;
let threadId;

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

  await logUserIn(firstFriend);
  await logUserIn(secondFriend);
  badToken = firstFriend.token ? firstFriend.token.slice(0, -1) : null;
});

// delete both users
afterAll(async () => {
  async function deleteUser(userObject) {
    const user = await security.listUserDataFromToken(userObject.token);
    const token = userObject.token;
    const userId = user.user.id;
    await request(app)
      .delete(`/user/${userId}/delete`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
  }

  await deleteUser(firstFriend);
  await deleteUser(secondFriend);
});

// test creating new message and starting a thread
test("Create new message & thread fails when not signed in", (done) => {
  request(app)
    .post(`/message/${wrongId}`)
    .expect(401)
    .expect("Content-Type", /json/)
    .expect({ message: "you have to be logged in to do that" }, done);
});

test("Create new message & thread fails when token has been altered", (done) => {
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

test("Create new message & thread fails when friend doesn't exist", (done) => {
  request(app)
    .post(`/message/${wrongId}`)
    .set("Authorization", `Bearer ${firstFriend.token}`)
    .expect(404)
    .expect("Content-Type", /json/)
    .expect({ message: "that friend wasn't found" }, done);
});

test("Create new message & thread returns the message object", async () => {
  const newMessage = await request(app)
    .post(`/message/${wrongId}`)
    .set("Authorization", `Bearer ${firstFriend.token}`)
    .type("form")
    .send(message)
    .expect(200)
    .expect("Content-Type", /json/);

  console.log(message);
});

// test list an existing single message
test("List message fails when not signed in", (done) => {
  request(app)
    .get(`/message/${wrongId}`)
    .expect(401)
    .expect("Content-Type", /json/)
    .expect({ message: "you have to be logged in to do that" }, done);
});

test("List message fails when token has been altered", (done) => {
  request(app)
    .get(`/message/${wrongId}`)
    .set("Authorization", `Bearer ${badToken}`)
    .expect(403)
    .expect("Content-Type", /json/)
    .expect(
      { message: "there was an error with your login, please sign in again" },
      done
    );
});

test("List message fails when message doesn't exist", (done) => {
  request(app)
    .get(`/message/${wrongId}`)
    .set("Authorization", `Bearer ${firstFriend.token}`)
    .expect(404)
    .expect("Content-Type", /json/)
    .expect({ message: "that message wasn't found" }, done);
});

// test creating a message on an existing thread
test("Create message on a thread fails when not signed in", (done) => {
  request(app)
    .post(`/message/thread/${wrongId}`)
    .expect(401)
    .expect("Content-Type", /json/)
    .expect({ message: "you have to be logged in to do that" }, done);
});

test("Create message fails when token has been altered", (done) => {
  request(app)
    .post(`/message/thread/${wrongId}`)
    .set("Authorization", `Bearer ${badToken}`)
    .expect(403)
    .expect("Content-Type", /json/)
    .expect(
      { message: "there was an error with your login, please sign in again" },
      done
    );
});

test("Create message on a thread fails when thread doesn't exist", (done) => {
  request(app)
    .post(`/message/thread/${wrongId}`)
    .set("Authorization", `Bearer ${firstFriend.token}`)
    .expect(404)
    .expect("Content-Type", /json/)
    .expect({ message: "that thread wasn't found" }, done);
});

// test list an existing message thread
test("List message fails when not signed in", (done) => {
  request(app)
    .get(`/message/thread/${wrongId}`)
    .expect(401)
    .expect("Content-Type", /json/)
    .expect({ message: "you have to be logged in to do that" }, done);
});

test("List message fails when token has been altered", (done) => {
  request(app)
    .get(`/message/thread/${wrongId}`)
    .set("Authorization", `Bearer ${badToken}`)
    .expect(403)
    .expect("Content-Type", /json/)
    .expect(
      { message: "there was an error with your login, please sign in again" },
      done
    );
});

test("List message fails when message doesn't exist", (done) => {
  request(app)
    .get(`/message/thread/${wrongId}`)
    .set("Authorization", `Bearer ${firstFriend.token}`)
    .expect(404)
    .expect("Content-Type", /json/)
    .expect({ message: "that thread wasn't found" }, done);
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

// test deleting a message thread
test("Delete thread fails when not signed in", (done) => {
  request(app)
    .delete(`/message/thread/${wrongId}`)
    .type("form")
    .send(message)
    .expect(401)
    .expect("Content-Type", /json/)
    .expect({ message: "you have to be logged in to do that" }, done);
});

test("Delete thread fails when token has been altered", (done) => {
  const token = firstFriend.token.slice(0, -1);

  request(app)
    .delete(`/message/thread/${wrongId}`)
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

test("Delete thread fails when thread doesn't exist", (done) => {
  request(app)
    .delete(`/message/thread/${wrongId}`)
    .set("Authorization", `Bearer ${firstFriend.token}`)
    .type("form")
    .send(message)
    .expect(404)
    .expect("Content-Type", /json/)
    .expect({ message: "that thread wasn't found" }, done);
});
