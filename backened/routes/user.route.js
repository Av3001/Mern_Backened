import express from "express"
import UserController from "../controllers/user.controller.js"
import checkUserAuth from "../middlewares/auth.middleware.js";


const router=express.Router();

// Route Level Middleware-to Protect Route
router.use("/changepassword",checkUserAuth)

router.post("/register",UserController.userRegistration)
router.post("/login",UserController.userLogin)

//Protected Routes
router.post("/changepassword",UserController.changeUserPassword)


export default router