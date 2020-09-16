const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const { UserModel } = require("../db");

let connectionCount = 0;
io.use(async function (socket, next) {
  const handshakeData = socket.request;
  console.log("middleware:", handshakeData._query["nick"]);
  const user = await UserModel.findOne({
    nickname: handshakeData._query["nick"],
  });
  try {
    user.isOnline = true;
    await user.save();
    next();
  } catch (error) {}
});
io.on("connection", async (socket) => {
  connectionCount += 1;
  console.log("a user connected", connectionCount);
  socket.on("disconnect", async () => {
    connectionCount -= 1;
    const handshakeData = socket.request;
    console.log("user disconnected", handshakeData._query["nick"]);
    const user = await UserModel.findOne({
      nickname: handshakeData._query["nick"],
    });
    try {
      user.isOnline = false;
      await user.save();
      next();
    } catch (error) {}
  });
});

module.exports = { http, app, express };
