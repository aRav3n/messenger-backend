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

// create firstFriend and secondFriend
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
});

// delete firstFriend and secondFriend
afterAll(async () => {
  async function deleteUser(userObject) {
    const user = await security.listUserDataFromToken(userObject.token);
    await request(app)
      .delete(`/user/${user.user.id}/delete`)
      .set("Authorization", `Bearer ${userObject.token}`)
      .expect(200);
    userObject.id = null;
    userObject.token = null;
  }

  await deleteUser(firstFriend);
  await deleteUser(secondFriend);
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
    .expect(200)
    .expect("Content-Type", /json/)
    .expect(
      { message: `New friendship with ${secondFriend.name} added!` },
      done
    );
});

test("Adding duplicate friendship fails", (done) => {
  request(app)
    .post("/friend")
    .set("Authorization", `Bearer ${firstFriend.token}`)
    .type("form")
    .send({ name: secondFriend.name })
    .expect(409, done);
});

test("List friends fails with nonexistent user ID", (done) => {
  request(app)
    .get(`/friend/${wrongId}`)
    .expect(404)
    .expect("Content-Type", /json/)
    .expect(
      { message: `No friendships found for user with id of ${wrongId}` },
      done
    );
});

test("List friends given a user ID works", (done) => {
  request(app)
    .get(`/friend/${firstFriend.id}`)
    .expect(200)
    .expect("Content-Type", /json/)
    .expect([secondFriend.name], done);
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
