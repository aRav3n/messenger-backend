const router = require("../routes/router");

const request = require("supertest");
const express = require("express");
const app = express();
require("dotenv");

const security = require("../controllers/security");
const userTests = require("./userTests");

app.use(express.urlencoded({ extended: false }));
app.use("/", router);

userTests.run(request, app, security);
