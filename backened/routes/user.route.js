import express from "express"
import UserController from "../controllers/user.controller.js"
import checkUserAuth from "../middlewares/auth.middleware.js";


const router=express.Router();

// Route Level Middleware-to Protect Route
router.use("/changepassword",checkUserAuth)
router.use("/loggeduser",checkUserAuth)
// Public Routes
router.post("/register",UserController.userRegistration)
router.post("/login",UserController.userLogin)
router.post("/send-user-password-email",UserController.sendUserResetEmail)
router.post("/reset-password/:id/:token",UserController.userPasswordReset)

//Protected Routes
router.post("/changepassword",UserController.changeUserPassword)
router.get("/loggedUser",UserController.loggedUser)


export default router