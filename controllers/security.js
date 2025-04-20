const jwt = require("jsonwebtoken");
require("dotenv");
const query = require("../db/queries");

const secretKey = process.env.SECRET_KEY;

function getTokenFromReq(req) {
  const bearerHeader = req.headers["authorization"];
  if (bearerHeader !== undefined) {
    const bearer = bearerHeader.split(" ");
    const token = bearer[bearer.length - 1];
    return token;
  }
  return null;
}

async function listUserDataFromToken(token) {
  if (token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secretKey, (err, authData) => {
        if (!authData) {
          resolve(null);
        } else if (err) {
          reject(err);
        } else if (authData) {
          resolve(authData);
        }
      });
    });
  }
}

async function getAuthData(req) {
  let token = null;
  if (req.token) {
    token = req.token;
  } else {
    token = getTokenFromReq(req);
  }

  const authData = await listUserDataFromToken(token);
  return authData;
}

async function gerUserData(req) {
  const authData = await getAuthData(req);
  if (authData) {
    const user = authData.user;
    user.iat = authData.iat;
    return user;
  }
  return null;
}

async function sign(user) {
  return new Promise((resolve, reject) => {
    jwt.sign({ user }, secretKey, async (err, token) => {
      if (err) {
        reject(err);
      }
      resolve(token);
    });
  });
}

function verify(req, res, next) {
  const token = getTokenFromReq(req);
  if (!token) {
    return res
      .status(401)
      .json({ message: "you have to be logged in to do that" });
  }
  req.token = token;
  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: "there was an error with your login, please sign in again",
      });
    } else {
      req.user = user;
      next();
    }
  });
}

module.exports = { gerUserData, listUserDataFromToken, sign, verify };
