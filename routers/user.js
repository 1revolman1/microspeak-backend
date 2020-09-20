const express = require("express");
const user = express.Router();
const { UserModel, ChatModel } = require("../db");
const { JWTlCookieMiddleware } = require("../auth");

user.post("/findeusers", JWTlCookieMiddleware, async (req, res) => {
  const {
    ip,
    body: { text },
  } = req;
  try {
    const users = await UserModel.find({ nickname: { $regex: text } });
    const filtered = users.map(
      ({ nickname, avatar, email, isOnline }, index) => {
        return {
          nickname,
          avatar: `${process.env.SERVER_LINK}/user-public/avatars/${avatar}`,
          email,
          isOnline,
        };
      }
    );
    res.json({ users: filtered });
  } catch (error) {
    res.status(300);
    res.json({ success: false });
  }
});

user.post("/createchat", JWTlCookieMiddleware, async (req, res) => {
  const {
    ip,
    user,
    body: { chat_name, with_whom },
  } = req;
  try {
    const usersIDArray = await Promise.all(
      with_whom.map(async (nickname) => {
        const { _id } = await UserModel.findOne({
          nickname,
        });
        return _id;
      })
    );
    const arrayOfChatParticipantsID = [
      `${user._id}`,
      ...usersIDArray.map((id) => `${id}`),
    ];
    const uniqueChatId = [...new Set(arrayOfChatParticipantsID)];
    const Chat = new ChatModel({
      name: chat_name,
      users: uniqueChatId,
      chatType: uniqueChatId.length > 2 ? "groupe" : "single",
    });
    await Chat.save();
    res.json({ success: true, data: Chat });
  } catch (error) {
    res.status(300);
    res.json({ success: false });
  }
});

user.get("/chats/:id", JWTlCookieMiddleware, async (req, res) => {
  const {
    ip,
    user: { _id },
    params: { id },
  } = req;
  try {
    //Найдет коллекцию чатов запросившего
    const { chatLists } = await UserModel.findById(`${_id}`);
    //Найдет чаты, айди которых есть у запросившего, членами которых есть человек айди которого есть в гет запросе.
    const chats = await ChatModel.find({
      _id: { $in: chatLists },
      users: { $all: [`${id}`] },
      chatType: "single",
    });
    res.json({ success: true, chats });
  } catch (error) {
    res.status(300);
    res.json({ success: false });
  }
});

user.get("/chats", JWTlCookieMiddleware, async (req, res) => {
  const {
    ip,
    user: { _id },
  } = req;
  try {
    const { chatLists } = await UserModel.findById(`${_id}`);
    const chatArray = await ChatModel.find({
      _id: { $in: chatLists },
    });
    res.json({ success: true, chatArray });
  } catch (error) {
    res.status(300);
    res.json({ success: false });
  }
});

user.get("/initialdata", JWTlCookieMiddleware, async (req, res) => {
  const {
    ip,
    user: { _id },
  } = req;
  try {
    //that's work
    const { chatLists, friendLists } = await UserModel.findById(`${_id}`);
    const chatArray = await ChatModel.find({
      _id: { $in: chatLists },
    });
    const friendArray = await UserModel.find({
      _id: { $in: friendLists },
    }).select({ nickname: 1, avatar: 1, isOnline: 1 });
    res.json({ success: true, chatArray, friendArray });
  } catch (error) {
    res.status(300);
    res.json({ success: false });
  }
});

user.post("/addtofriend", JWTlCookieMiddleware, async (req, res) => {
  const {
    ip,
    user: { _id },
    body: { id },
  } = req;
  try {
    const arrayOfFriend = [_id, id];
    const users = await UserModel.find({ _id: { $in: [id, _id] } });
    await Promise.all(
      users.map(async (user) => {
        await UserModel.findOneAndUpdate(
          {
            _id: user._id,
          },
          {
            $addToSet: {
              friendLists: arrayOfFriend.filter((elm) => elm !== user.id),
            },
          }
        );
      })
    );
    res.json({ success: true });
  } catch (error) {
    res.status(300);
    res.json({ success: false });
  }
});

module.exports = { user };
