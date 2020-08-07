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

auth.post("/registration", async (req, res) => {
  const User = new UserModel(req.body);
  try {
    const result = await User.save();
    res.json({ success: true, data: User });
  } catch (error) {
    res.json({ success: false, data: error.toString() });
  }
});

auth.post("/login", loginLocalMiddleware, async (req, res) => {
  if (req.user) {
    const { email, avatar, active, _id } = req.user;
    const refreshTokenTime = Math.floor(Date.now() / 1000) + 60 * 60;
    // const refreshTokenTime = Math.floor(
    //   moment().add(1, "hour").valueOf() / 1000
    // );
    const refreshToken = jwt.sign(
      {
        email,
        _id,
        exp: refreshTokenTime,
        // exp: Math.floor(Date.now() / 1000) + 60,
        // exp: 10,
        // exp: refreshTokenTime,
      },
      process.env.SECRET
    );
    const accessToken = jwt.sign(
      {
        email,
        _id,
        exp: Math.floor(Date.now() / 1000) + 60,
        // exp: 5000,
      },
      process.env.SECRET
      // { expiresIn: "1m" }
    );
    try {
      const response = await UserModel.updateOne({ email }, { refreshToken });
      res.cookie("JWT", refreshToken, {
        maxAge: refreshTokenTime,
        httpOnly: true,
        path: "/api/authentication",
      });
      res.json({
        login: true,
        data: { email, avatar, active, _id },
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
      user: { email, avatar, active, _id },
    } = req;
    try {
      const user = await UserModel.findById(_id);
      if (!user) {
        res.status(401);
        res.cookie("JWT", "213", {
          maxAge: 0,
          httpOnly: true,
          path: "/api/authentication",
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
          path: "/api/authentication",
        });
        res.json({ login: false, error: "TOKEN EXPIRED" });
      } else {
        const refreshTokenTime = Math.floor(Date.now() / 1000) + 60 * 60;
        const refreshToken = jwt.sign(
          {
            email,
            _id,
            exp: refreshTokenTime,
          },
          process.env.SECRET
        );
        const accessToken = jwt.sign(
          {
            email,
            _id,
          },
          process.env.SECRET,
          { expiresIn: "1h" }
        );
        const response = await UserModel.updateOne({ email }, { refreshToken });
        res.cookie("JWT", refreshToken, {
          maxAge: refreshTokenTime,
          httpOnly: true,
          path: "/api/authentication",
        });
        res.json({
          login: true,
          data: { email, avatar, active, _id },
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
