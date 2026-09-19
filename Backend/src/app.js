const express = require('express')
const cookieparser = require('cookie-parser')
const cors = require("cors")

const app = express();

app.use(express.json());  
app.use(cookieparser());
app.use(cors({
  origin : "http://localhost:5173",
  credentials: true
}))

/* require all the router here */
const authRouter = require('./Router/auth.routes')
const interviewRouter = require('./Router/interview.routes')

/* using all the router here */ 
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)




module.exports = app;