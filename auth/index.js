const passport = require("passport");
const localFactory = require("./local");
const { JWTCookieFactory, JWTHeaderFactory } = require("./jwt");
passport.use("login", localFactory());
passport.use("jwtCookie", JWTCookieFactory());
passport.use("jwtAuth", JWTHeaderFactory());

function loginLocalMiddleware(...args) {
  return passport.authenticate(
    "login",
    {
      session: false,
      passReqToCallback: true,
    },
    (error, receiveData, info) => {
      const [req, res, next] = args;
      if (receiveData) {
        req.user = receiveData;
        next();
      } else {
        res.status(info.status || 401);
        res.json(info);
      }
    }
  )(...args);
}
function JWTlCookieMiddleware(...args) {
  return passport.authenticate(
    "jwtCookie",
    { session: false },
    (error, receiveData, info) => {
      const [req, res, next] = args;
      if (receiveData) {
        req.user = receiveData;
        next();
      } else {
        res.sendStatus(info.status || 401);
      }
    }
  )(...args);
}
function JWTlAuthMiddleware(...args) {
  return passport.authenticate(
    "jwtAuth",
    { session: false },
    (error, receiveData, info) => {
      const [req, res, next] = args;
      if (receiveData) {
        req.user = receiveData;
        next();
      } else {
        res.sendStatus(info.status || 401);
        // res.json(info);
      }
    }
  )(...args);
}
module.exports = {
  loginLocalMiddleware,
  JWTlCookieMiddleware,
  JWTlAuthMiddleware,
  passport,
};
