const express = require("express");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const auth = express.Router();
const { UserModel } = require("../db");
const {
  loginLocalMiddleware,
  JWTlCookieMiddleware,
  JWTlAuthMiddleware,
} = require("../auth");

//JSON expires in seconds. COOKIES in mini seconds

auth.post("/registration", async (req, res) => {
  const User = new UserModel(req.body);
  try {
    const result = await User.save();
    res.json({
      success: true,
      nickname: result.nickname,
      avatar: result.avatar,
      email: result.email,
      fingerprint: result.fingerprint,
    });
  } catch (error) {
    res.status(400);
    res.json({ success: false, data: error.toString() });
  }
});

auth.post("/login", loginLocalMiddleware, async (req, res) => {
  if (req.user) {
    const {
      user: { email, avatar, nickname, active, _id },
      body: { fingerprint },
    } = req;
    //IN MINI SECONDS
    const refreshTokenTime = moment();
    const refreshToken = jwt.sign(
      {
        email,
        _id,
        exp: Math.floor(refreshTokenTime.add(24, "hour").valueOf() / 1000),
      },
      process.env.SECRET
    );
    const accessToken = jwt.sign(
      {
        email,
        _id,
        exp: Math.floor(refreshTokenTime.add(1, "hour").valueOf() / 1000),
      },
      process.env.SECRET
    );
    try {
      const response = await UserModel.updateOne(
        { email },
        { refreshToken, fingerprint }
      );
      res.cookie("JWT", refreshToken, {
        //It's about in how many miliseconds your cookie will expire.
        maxAge: 3600000 * 24,
        httpOnly: true,
        path: "/",
      });
      res.json({
        login: true,
        data: {
          nickname,
          email,
          avatar: `${process.env.SERVER_LINK}/user-public/avatars/${avatar}`,
          active,
          _id,
        },
        accessToken,
      });
    } catch (error) {
      console.log("Some error accused ", error);
      res.json({ login: false, message: "ERROR IN ADDING TOKEN" });
    }
  } else res.sendStatus(401);
});

auth.post("/refresh-token", JWTlCookieMiddleware, async (req, res) => {
  if (req.user) {
    const {
      ip,
      user: { email, _id },
    } = req;
    try {
      const user = await UserModel.findById(_id);
      if (!user) {
        res.status(401);
        res.cookie("JWT", "213", {
          maxAge: 0,
          httpOnly: true,
          path: "/",
        });
        res.json({ login: false, error: "Missing user" });
      } else if (!user.isValidFingerPrint(req.body.fingerprint)) {
        const response = await UserModel.updateOne(
          { email },
          { refreshToken: "" }
        );
        res.status(401);
        res.cookie("JWT", "213", {
          maxAge: 0,
          httpOnly: true,
          path: "/",
        });
        res.json({ login: false, error: "No valid fingerpring" });
      } else if (!user.isValidRefreshToken(req.cookies["JWT"])) {
        const response = await UserModel.updateOne(
          { email },
          { refreshToken: "" }
        );
        res.status(401);
        res.cookie("JWT", "213", {
          maxAge: 0,
          httpOnly: true,
          path: "/",
        });
        res.json({ login: false, error: "No valid token" });
      } else {
        const refreshTokenTime = moment();
        const refreshToken = jwt.sign(
          {
            email,
            _id,
            exp: Math.floor(refreshTokenTime.add(24, "hour").valueOf() / 1000),
          },
          process.env.SECRET
        );
        const accessToken = jwt.sign(
          {
            email,
            _id,
            exp: Math.floor(refreshTokenTime.add(1, "hour").valueOf() / 1000),
          },
          process.env.SECRET
          // { expiresIn: "1h" }
        );
        const response = await UserModel.updateOne({ email }, { refreshToken });
        res.cookie("JWT", refreshToken, {
          maxAge: 3600000 * 24,
          httpOnly: true,
          path: "/",
        });
        res.json({
          login: true,
          data: {
            email,
            avatar: user.avatar,
            active: user.active,
            nickname: user.nickname,
            _id,
          },
          accessToken,
        });
      }
    } catch (error) {
      console.log("Some error accused ", error);
      res.json({ login: false, message: error });
    }
  } else res.sendStatus(401);
});

auth.get("/authtokencheck", JWTlAuthMiddleware, (req, res) => {
  if (req.user) {
    res.json({ login: true, data: req.user });
  } else res.sendStatus(401);
});

module.exports = { auth };
