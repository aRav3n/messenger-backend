const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const db = require("../db/queries");
const security = require("./security");

const pwError = "Password must be between 6 and 16 characters";
const pwMatchError = "Passwords must match";
const validateUser = [
  body("name").trim(),
  body("email").trim().isEmail().withMessage(emailErr),
  body("password").trim().isLength({ min: 6, max: 16 }).withMessage(pwError),
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
  body("creatorPassword").trim(),
];

const createUser = [
  validateUser,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(errors);
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
        const token = security.sign(user);

        // for test purposes only
        console.log({ user, token });

        return res.status(201).json({ user, token });
      }
      return res
        .status(409)
        .json({ errors: ["a user with this name already exists"] });
    } catch (err) {
      console.error(err);

      if (err.name === "JsonWebTokenError") {
        return res.status(500).json({ errors: ["Token generation failed"] });
      }

      return res.status(500).json({ errors: ["Server error"] });
    }
  },
];

module.exports = {
  createUser,
};
