const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const db = require("../db/queries");
const security = require("./security");

const pwError = "Password must be between 6 and 16 characters";
const pwMatchError = "Passwords must match";
const validateUser = [body("name").trim(), body("password").trim()];
const validateUserCreation = [
  body("password").isLength({ min: 6, max: 16 }).withMessage(pwError),
  body("confirmPassword")
    .exists()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        return false;
      }
      return true;
    })
    .withMessage(pwMatchError)
    .trim(),
];

const createUser = [
  validateUser,
  validateUserCreation,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      // verify that the name is unique
      const name = req.body.name;
      const usersWithThisName = await db.listUserByName(name);
      const nameIsUnique =
        !usersWithThisName || usersWithThisName.length === 0 ? true : false;

      if (nameIsUnique) {
        const password = req.body.password;
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const user = await db.addUser(name, hash);

        return res.status(200).json(user);
      }
      return res
        .status(409)
        .json({ errors: ["a user with this name already exists"] });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ errors: ["Server error"] });
    }
  },
];

const deleteUser = [
  validateUser,
  async (req, res) => {
    try {
      const userInfo = req.user.user;
      if (!userInfo) {
        return;
      }

      const id = Number(req.params.userId);
      if (id !== userInfo.id) {
        return res.status(404).json({
          message: "You're not only able to delete your own account!",
        });
      }

      const deletedUser = await db.deleteUser(id);

      return res.status(200).json(deletedUser);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  },
];

const logUserIn = [
  validateUser,
  async (req, res) => {
    const password = req.body.password;
    const name = req.body.name;

    const dbUser = await db.listUserByName(name);
    if (!dbUser) {
      return res
        .status(404)
        .json({ message: `No user with the name ${name} was found` });
    }

    const passwordIsValid = bcrypt.compareSync(password, dbUser.hash);
    if (!passwordIsValid) {
      return res.status(401).json({ message: "That password is not valid" });
    }

    const token = await security.sign(dbUser);
    const { hash, ...user } = dbUser;
    user.token = token;

    return res.status(200).json(user);
  },
];

module.exports = {
  createUser,
  deleteUser,
  logUserIn,
};
