const { UserSchema } = require("./user");
const { createChatFunction } = require("./chat");
const { createMessageFunction } = require("./message");

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jcbbv.mongodb.net/microspeak?retryWrites=true&w=majority`;

const mongoose = require("mongoose");
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const UserModel = mongoose.model("UserModel", UserSchema, "users");
const ChatModel = mongoose.model(
  "ChatModel",
  createChatFunction(UserModel),
  "chats"
);
const MessageModel = mongoose.model(
  "MessageModel",
  createMessageFunction(createMessageFunction()),
  "messages"
);

module.exports = {
  mongoose,
  ChatModel,
  UserModel,
  MessageModel,
};
