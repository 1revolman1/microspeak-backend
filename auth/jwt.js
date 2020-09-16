const JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;

const JWTCookieFactory = function (
  option = {
    jwtFromRequest: function (req) {
      var token = null;
      if (req && req.cookies) {
        token = req.cookies["JWT"];
      }
      return token;
    },
    secretOrKey: process.env.SECRET,
  }
) {
  return new JwtStrategy(option, async function (jwt_payload, done) {
    done(null, jwt_payload);
  });
};
const JWTHeaderFactory = function (
  option = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET,
  }
) {
  return new JwtStrategy(option, async function (jwt_payload, done) {
    done(null, jwt_payload);
  });
};

module.exports = {
  JWTCookieFactory,
  JWTHeaderFactory,
};
