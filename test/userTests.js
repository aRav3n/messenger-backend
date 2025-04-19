const testUserCreation = {
  name: "Test User",
  password: "123456",
  confirmPassword: "123456",
};

const testUserLogin = {
  name: "Test User",
  password: "123456",
};

function run(request, app, security) {
  test("user - Signup route works", (done) => {
    request(app)
      .post("/user/signup")
      .type("form")
      .send(testUserCreation)
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        const body = response.body;
        expect(body).toHaveProperty("id");
        expect(body).toHaveProperty("hash");
        expect(body.name).toBe(testUserCreation.name);
        done();
      })
      .catch((err) => done(err));
  });

  test("user - Login route works", (done) => {
    request(app)
      .post("/user/login")
      .type("form")
      .send(testUserLogin)
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        const token = res.body.token;
        expect(token).toBeDefined();
        expect(typeof token).toBe("string");

        // Check that token looks like a JWT (three segments separated by dots)
        expect(token.split(".")).toHaveLength(3);
        done();
      })
      .catch(done);
  });

  test("user - Have to be logged in to delete account", (done) => {
    request(app)
      .delete("/user/1/delete")
      .expect("Content-Type", /json/)
      .expect({ message: "you have to be logged in to do that" })
      .expect(403, done);
  });

  test("user - User can only delete their own account", async () => {
    const res = await request(app)
      .post("/user/login")
      .type("form")
      .send(testUserLogin)
      .expect("Content-Type", /json/)
      .expect(200);

    const token = res.body.token;
    const userInfo = await security.listUserDataFromToken(token);
    const user = userInfo.user;

    await request(app)
      .delete(`/user/${user.id + 1}/delete`)
      .set("Authorization", `Bearer ${token}`)
      .expect({ message: "You're not only able to delete your own account!" })
      .expect(404);
  });

  test("user - Delete user route works", async () => {
    const res = await request(app)
      .post("/user/login")
      .type("form")
      .send(testUserLogin)
      .expect("Content-Type", /json/)
      .expect(200);

    const token = res.body.token;
    const userInfo = await security.listUserDataFromToken(token);
    const user = userInfo.user;

    await request(app)
      .delete(`/user/${user.id}/delete`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect(user);

    await request(app)
      .post("/user/login")
      .type("form")
      .send(testUserLogin)
      .expect(404)
      .expect({
        message: `No user with the name ${testUserLogin.name} was found`,
      });
  });
}

module.exports = { run };
