const LocalStrategy = require("passport-local").Strategy;
const { UserModel } = require("../db");

module.exports = function (
  option = { usernameField: "email", passwordField: "password" }
) {
  return new LocalStrategy(option, async function (login, password, done) {
    try {
      const user = await UserModel.findOne({ email: login });
      if (!user) {
        return done(null, false, { login: false, data: "Can`t find user" });
      } else if (!user.isValidPassword(password)) {
        return done(null, false, {
          login: false,
          data: "Password, that you entered didn`t exist",
        });
      } else {
        return done(null, user.toJSON());
      }
    } catch (error) {
      console.log(`Error ${error}`);
    }
  });
};
