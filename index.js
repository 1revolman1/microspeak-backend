//https://gist.github.com/zmts/802dc9c3510d79fd40f9dc38a12bccfc
require("dotenv").config();
const { http, express, app } = require("./socket");

const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require("cors");
app.set("trust proxy", true);
app.use(bodyParser.json());
app.use(helmet());
app.use(cookieParser());
// app.use(
//   session({
//     secret: "yes is not bad",
//     name: "sessionId",
//     resave: false,
//     saveUninitialized: true,
//     store: new MongoStore({
//       url: connectionOptions,
//     }),
//   })
// );
app.use(cors({ credentials: true, origin: process.env.PROXY_LINK }));
app.use(express.static(`${__dirname}/static`));

const { auth, settings, user } = require("./routers");
app.use("/api/authentication", auth);
app.use("/api/settings", settings);
app.use("/api/user", user);

http.listen(PORT, () => {
  console.log(`Server run at port: ${PORT}`);
});
