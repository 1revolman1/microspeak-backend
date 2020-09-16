const express = require("express");
const user = express.Router();
const { UserModel } = require("../db");
const { JWTlCookieMiddleware } = require("../auth");

user.post("/findeusers", JWTlCookieMiddleware, async (req, res) => {
  const {
    ip,
    body: { text },
  } = req;
  try {
    const users = await UserModel.find({ nickname: { $regex: text } });
    const filtered = users.map(
      ({ nickname, avatar, email, isOnline }, index) => {
        return {
          nickname,
          avatar: `${process.env.SERVER_LINK}/user-public/avatars/${avatar}`,
          email,
          isOnline,
        };
      }
    );
    res.json({ users: filtered });
  } catch (error) {
    console.log("Some error accused ", error);
    res.status(300);
    res.json({ error: true, message: error });
  }
});

module.exports = { user };
