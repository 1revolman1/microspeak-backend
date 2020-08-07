const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jcbbv.mongodb.net/microspeak?retryWrites=true&w=majority`;

const mongoose = require("mongoose");
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const { UserSchema } = require("./user");
const UserModel = mongoose.model("UserModel", UserSchema, "users");

module.exports = {
  mongoose,
  UserModel,
};
