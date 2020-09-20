const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const { UserModel, MessageModel } = require("../db");

let connectionCount = 0;
io.use(async function (socket, next) {
  const handshakeData = socket.request;
  console.log("middleware:", handshakeData._query["nick"]);
  await UserModel.findOneAndUpdate(
    {
      nickname: handshakeData._query["nick"],
    },
    { isOnline: true }
  );
  next();
});

io.on("connection", async (socket) => {
  connectionCount += 1;
  console.log("a user connected", connectionCount);
  socket.on("connect-to-channel", (msg) => {
    //msg - chat id
    socket.join(msg, () => {
      io.to(msg).emit("chat message", "HELLO");
    });
  });
  socket.on("disconnect", async () => {
    connectionCount -= 1;
    const handshakeData = socket.request;
    console.log("user disconnected", handshakeData._query["nick"]);
    try {
      await UserModel.findOneAndUpdate(
        {
          nickname: handshakeData._query["nick"],
        },
        { isOnline: false }
      );
      next();
    } catch (error) {}
  });
});

module.exports = { http, app, express };
