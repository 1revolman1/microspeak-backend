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
    console.log("Payload ", jwt_payload);
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
    // try {
    //   const user = await UserModel.findOne({ email: login });
    //   if (!user) {
    //     return done(null, false, { message: "Can`t find user" });
    //   } else if (!user.isValidPassword(password)) {
    //     return done(null, false, { message: "Password did not valid!" });
    //   } else {
    //     return done(null, user.toJSON());
    //   }
    //   //   if (user && user.isValidPassword(password)) {
    //   //    return done(null, user);
    //   //   } else {
    //   //     done(null, false);
    //   //   }
    // } catch (error) {
    //   console.log(`Error ${error}`);
    // }
  });
};

module.exports = {
  JWTCookieFactory,
  JWTHeaderFactory,
};
