const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const tokenblacklistModel = require('../models/blacklist.model')

/**
 * @name registerUserController
 * @descripton  register a new user , expects username , email nad password in request body 
 * @access public
 */
async function registerUserController(req,res) {
  
  const {username , email, password} = req.body

  if(!username || !email || !password){
    return res.status(400).json({
      massage: "Please provide usename , email and password"
    }) 
  }

const userAlreadyExists = await userModel.findOne({
  $or : [{username} ,  {email}]
})   

if(userAlreadyExists){   
  return res.status(400).json({
    massage : "Accout already exists with this username and Email address"
  })
}
  const hash = await bcrypt.hash(password,10)

  const user = await userModel.create({
     username,
     email,
     password:hash 
  })

  const token = jwt.sign(
    {id: user._id,username:user.username},
    process.env.JWT_SECRET,
    {expiresIn:"1d"}
  )

  res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 24 * 60 * 60 * 1000
});

  res.status(201).json({
    massage :"User successfully registered",
    user:{
      id: user._id,
      username:user.username,
      email:user.email   
    }
  })
}

/**
 * @name getMeController
 * @descripton  get the current logged in user details
 * @access private
 */
async function getMeController(req,res) {
  const user = await userModel.findById(req.user.id)

  res.status(200).json({
    message:"User details featch successfully.",
    user:{
      id: user._id,
      username: user.username,
      email: user.email
    }
  })
}

/**
 * @name loginUserController
 * @descripton  register a new user , expects username , email nad password in request body 
 * @access public
 */
async function loginUserController(req,res) {
   
  const {email,password} = req.body;
  const user =  await userModel.findOne({email})
  if(!user){
     return res.status(404).json({
      message : "Invalid email or password"
    })
  }
  
  const IsPasswordVaild = await bcrypt.compare(password,user.password)
  if(!IsPasswordVaild){
    return res.status(404).json({
      message : "Invalid email or password"
    })
  }

  const token = jwt.sign({id:user._id,username:user.username},
       process.env.JWT_SECRET,
       {expiresIn:"1d"}
  )

  res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 24 * 60 * 60 * 1000
}); 
  res.status(200).json({
    message:"User LoggedIn Successfully",
    user:{
      id : user._id,
      username : user.username,
      email : user.email
    }
  })
}
async function logoutUserController(req, res) {
  
  const token = req.cookies.token;
  if (token) {
    await tokenblacklistModel.create({ token });
  }

  res.clearCookie('token');

  res.status(200).json({
    message: "user logged out successfully"
  });
}
module.exports={
  registerUserController,
  loginUserController,
  logoutUserController,
  getMeController
}