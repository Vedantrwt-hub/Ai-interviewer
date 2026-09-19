const {Router} = require('express');
const authController = require('../controllers/auth.controller')
const authmiddleware = require('../middlewares/auth.middleware') 

const authRouter = Router();

/**
 * @router POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
authRouter.post("/Register",authController.registerUserController)

/**
 * @router POST /api/auth/login
 * @description login with username and password 
 * @access Public
 */
authRouter.post("/Login", authController.loginUserController)

/**
 * @router POST /api/auth/logout
 * @description clear token from user cookie and add the token in blacklist 
 * @access Public
 */
authRouter.get("/Logout",authController.logoutUserController)

/**
 * @router GET/api/auth/get-me
 * @description get the current logged user details
 * @access private
*/
authRouter.get("/Get-me",authmiddleware.authUser,authController.getMeController)

module.exports = authRouter; 