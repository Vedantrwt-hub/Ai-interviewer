const mongoose = require('mongoose');

async function connectDB(){
   
  try{
    
    await mongoose.connect(process.env.MONGO_URL)

    console.log("Connect to DataBase")

  }
  catch(err){
    console.log(err);
  }
}

module.exports = connectDB;