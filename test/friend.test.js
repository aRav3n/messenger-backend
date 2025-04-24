const router = require("../routes/router");

const request = require("supertest");
const express = require("express");
const app = express();
require("dotenv");

const db = require("../db/queries");

app.use(express.urlencoded({ extended: false }));
app.use("/", router);

const password = "123456";
const firstFriend = { name: "Friend Test User 1", password };
const secondFriend = { name: "Friend Test User 2", password };
const wrongName = "Maximus Decimus Meridius";
const wrongId = 0;

// create firstFriend and secondFriend
beforeAll(async () => {
  async function createUserAccount(userObject) {
    await request(app)
      .post("/user/signup")
      .type("form")
      .send({ confirmPassword: password, ...userObject })
      .then((res) => {
        const user = res.body;
        userObject.id = user.id;
      });
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
});

// delete firstFriend and secondFriend
afterAll(async () => {
  firstFriend.id ? await db.deleteUser(firstFriend.id) : null;
  secondFriend.id ? await db.deleteUser(secondFriend.id) : null;
  firstFriend.id = null;
  firstFriend.token = null;
  secondFriend.id = null;
  secondFriend.token = null;
  await db.deleteAllUsers();
});

test("Adding friend route fails when not logged in", (done) => {
  request(app)
    .post("/friend")
    .type("form")
    .send({ name: wrongName })
    .expect(401)
    .expect({ message: "you have to be logged in to do that" }, done);
});

test("Adding nonexistent friend name returns 404", (done) => {
  request(app)
    .post("/friend")
    .set("Authorization", `Bearer ${firstFriend.token}`)
    .type("form")
    .send({ name: wrongName })
    .expect(404)
    .expect(
      { message: `${wrongName} was not found in the user database` },
      done
    );
});

test("Adding friend by username works", (done) => {
  request(app)
    .post("/friend")
    .set("Authorization", `Bearer ${firstFriend.token}`)
    .type("form")
    .send({ name: secondFriend.name })
    .expect("Content-Type", /json/)
    .expect(200)
    .then((res) => {
      const friendship = res.body;
      expect(friendship).toHaveProperty("id");
      expect(friendship).toHaveProperty("userAId");
      expect(friendship).toHaveProperty("userBId");
      done();
    });
});

test("Adding duplicate friendship fails", (done) => {
  request(app)
    .post("/friend")
    .set("Authorization", `Bearer ${firstFriend.token}`)
    .type("form")
    .send({ name: secondFriend.name })
    .then(() => {
      request(app)
        .post("/friend")
        .set("Authorization", `Bearer ${firstFriend.token}`)
        .type("form")
        .send({ name: secondFriend.name })
        .expect(409, done);
    });
});

test("List friends fails with nonexistent user ID", (done) => {
  request(app)
    .get(`/friend/${wrongId}`)
    .expect(400)
    .expect("Content-Type", /json/)
    .expect({ message: `no user with an id of ${wrongId} found` }, done);
});

test("List friends given a user ID works", (done) => {
  request(app)
    .get(`/friend/${firstFriend.id}`)
    .expect("Content-Type", /json/)
    .expect([secondFriend.name])
    .expect(200, done);
});

test("Delete friend fails when not signed in", (done) => {
  request(app)
    .delete(`/friend/${secondFriend.id}`)
    .type("form")
    .send({ name: secondFriend.name })
    .expect(401)
    .expect("Content-Type", /json/)
    .expect({ message: "you have to be logged in to do that" }, done);
});

test("Delete friend works when logged in and has correct friend name", (done) => {
  request(app)
    .delete(`/friend/${secondFriend.id}`)
    .set("Authorization", `Bearer ${firstFriend.token}`)
    .type("form")
    .send({ name: secondFriend.name })
    .expect(200)
    .expect("Content-Type", /json/)
    .then((res) => {
      const deletedFriendship = res.body;
      const smallerId = Math.min(firstFriend.id, secondFriend.id);
      const largerId = Math.max(firstFriend.id, secondFriend.id);
      expect(deletedFriendship).toHaveProperty("id");
      expect(deletedFriendship.userAId).toBe(smallerId);
      expect(deletedFriendship.userBId).toBe(largerId);
      done();
    })
    .catch((err) => done(err));
});

test("Delete friend returns 404 if name not in friend list", (done) => {
  request(app)
    .delete(`/friend/${wrongId}`)
    .set("Authorization", `Bearer ${firstFriend.token}`)
    .type("form")
    .send({ name: wrongName })
    .expect(404)
    .expect("Content-Type", /json/)
    .expect({ message: "that user wasn't found" }, done);
});
