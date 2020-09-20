// const { UserModel, createUserModel } = require("./index");

const Schema = require("mongoose").Schema;

const createChatFunction = function (UserModel) {
  const ChatSchema = new Schema({
    name: {
      type: String,
      required: true,
      default: "Our chat!",
    },
    users: {
      type: [],
      unique: true,
    },
    messages: {
      type: [],
      default: [],
    },
    avatar: {
      type: String,
      default: `${process.env.SERVER_LINK}/user-public/avatars/default.png`,
    },
    chatType: {
      type: String,
      required: true,
    },
  });
  ChatSchema.post("save", async function () {
    const { users, _id } = this;
    try {
      await UserModel.updateMany(
        {
          _id: { $in: users },
        },
        { $addToSet: { chatLists: [_id] } }
      );
    } catch (error) {
      throw error;
    }
  });
  return ChatSchema;
};

module.exports = {
  createChatFunction,
};
