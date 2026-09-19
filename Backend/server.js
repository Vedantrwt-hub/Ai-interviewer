const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
require('dotenv').config();


const app = require('./src/app');
const connectDB = require('./src/config/database');


connectDB();




app.listen(3000, () =>{
  console.log(`Sever is connected at Port 3000`)
})