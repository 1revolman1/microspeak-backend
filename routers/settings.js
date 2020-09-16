const express = require("express");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const settings = express.Router();
const { UserModel } = require("../db");
const { JWTlCookieMiddleware } = require("../auth");

settings.post("/changenickname", JWTlCookieMiddleware, async (req, res) => {
  const {
    ip,
    user: { email, _id },
    body: { nickname },
  } = req;
  try {
    const user = await UserModel.findById(_id);
    if (nickname !== user.nickname) {
      user.nickname = nickname;
      await user.save();
      res.status(200);
      res.json({ email, nickname: user.nickname, avatar: user.avatar });
    }
    res.json({ error: true, message: "You changing the same nickname" });
  } catch (error) {
    console.log("Some error accused ", error);
    res.status(300);
    res.json({ error: true, message: error });
  }
});

module.exports = { settings };
