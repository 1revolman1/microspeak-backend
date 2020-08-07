const Schema = require("mongoose").Schema;
const moment = require("moment");
const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (email) => /.+@.{2,25}\..{1,10}/.test(email),
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  nickname: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    validate: {
      validator: (password) =>
        /(?=.*[0-9])(?=.*[!@#$%^&_*])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&_*]{6,}/.test(
          password
        ),
      message: (props) =>
        `This password "${props.value}" didn't valid. Your password must consist at least one digit, one special symbol, one lowercase and uppercase english symbol. Example: a0A#ccsxcvx`,
    },
  },
  active: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expirePay: {
    type: Date,
    default: Date.now,
  },
  avatar: {
    type: String,
    default: "default.png",
  },
  refreshToken: {
    type: String,
    default: "",
  },
  fingerprint: {
    type: String,
    minlength: 32,
  },
});
UserSchema.methods.isValidPassword = function (newPassword) {
  return this.password === newPassword;
};
UserSchema.methods.isValidRefreshToken = function (newToken) {
  return this.refreshToken === newToken;
};
UserSchema.methods.isValidFingerPrint = function (newFingerPrint) {
  return this.fingerprint === newFingerPrint;
};
UserSchema.pre("save", function () {
  this.expirePay = moment().add(7, "days").toDate();
});
module.exports = {
  UserSchema,
};
