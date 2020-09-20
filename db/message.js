const Schema = require("mongoose").Schema;
const moment = require("moment");

const createMessageFunction = function (ChatSchema) {
  const MessageSchema = new Schema({
    type: {
      type: String,
      required: true,
      validate: {
        validator: (type) => /(MESSAGE|IMG|VIDEO)/.test(type),
        message: (type) => `${type} is not a valid for our scheme!`,
      },
    },
    data: {
      type: String,
      required: true,
    },
    chat: {
      type: String,
      required: true,
    },
    owner: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });
  MessageSchema.post("save", async function () {
    const { chat, _id } = this;
    try {
      await ChatSchema.updateMany(
        {
          _id: chat,
        },
        { $addToSet: { messages: [_id] } }
      );
    } catch (error) {
      throw error;
    }
  });
  return MessageSchema;
};

module.exports = {
  createMessageFunction,
};
