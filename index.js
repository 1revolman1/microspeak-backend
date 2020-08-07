//https://gist.github.com/zmts/802dc9c3510d79fd40f9dc38a12bccfc
require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const cors = require("cors");
app.set("trust proxy", true);
app.use(bodyParser.json());
app.use(helmet());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: process.env.PROXY_LINK }));
app.use(express.static(`${__dirname}/static`));

const { auth } = require("./routers");

app.use("/api/authentication", auth);

app.listen(PORT, () => {
  console.log(`Server run at port: ${PORT}`);
});
