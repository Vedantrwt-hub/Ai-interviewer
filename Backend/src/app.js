const express = require("express");
const cookieparser = require("cookie-parser");
const cors = require("cors");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://mern-frontend-7.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests like Postman/server-to-server
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieparser());

/* require all the router here */
const authRouter = require("./Router/auth.routes");
const interviewRouter = require("./Router/interview.routes");

/* using all the router here */
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

module.exports = app;