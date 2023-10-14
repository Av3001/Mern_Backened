import UserModel from "../models/User.js"
import bcrypt from "bcrypt"
import JWT from "jsonwebtoken"

class UserController {
    static userRegistration=async(req,res)=>{
        const {name, email,password,password_conf,tc}=req.body
        const user=await UserModel.findOne({email:email})
        if(user){
            res.send({"status":"failed","message":"Email already exists"})

        } else{
            if(name &&email && password_conf &&tc){
                if(password===password_conf){
                   try {
                    const salt=await bcrypt.genSalt(10)
                    const hashPassword=await bcrypt.hash(password,salt)
                    const newUser=new UserModel({
                        name:name,
                        email:email,
                        password:hashPassword,
                        tc:tc
                    })
                    await newUser.save()
                    // Generate JWT token
                    const saved_User=await UserModel.findOne({email:email})
                    const token=JWT.sign({userId:saved_User._id},process.env.JWT_SECRET_KEY,{expiresIn:"5d"})

                    res.status(201).send({"status":"Success","message":" Registeration successful","token":token})
                   } catch (error) {
                        res.send({"status":"failed","message":"Unable to Register"})
                   }
                    
                }else{
                    res.send({"status":"failed","message":"Password and confirm password does'nt match."})
                }
            }else{
                res.send({"status":"failed","message":"Email already exists"})
            }
        }
    }

    static userLogin=async(req,res)=>{
        try {
            const {email,password}=req.body
            if (email && password) {
                const user=await UserModel.findOne({email:email}) 
                if(user!=null){
                    const isMatch=await bcrypt.compare(password,user.password)
                    if((user.email==email && isMatch)){
                        // Token generation
                        const token=JWT.sign({userID:user._id},process.env.JWT_SECRET_KEY,{expiresIn:"5d"})
                        
                        res.send({"status":"success","message":"Login Success.","token":token})
                        
                    }else {
                    res.send({"status":"failed","message":"Email and Password does not match."})
                }
                }else {
                    res.send({"status":"failed","message":"You are not a Registered User."})
                }
            }else{
                res.send({"status":"failed","message":"All fields are Required"})
            } 
        } catch (error) {
            
                res.send({"status":"failed","message":"Unable to Login."})
            
        }
    }
    static changeUserPassword = async (req, res) => {
        const { password, password_confirmation } = req.body
        if (password && password_confirmation) {
          if (password !== password_confirmation) {
            res.send({ "status": "failed", "message": "New Password and Confirm New Password doesn't match" })
          } else {
            const salt = await bcrypt.genSalt(10)
            const newHashPassword = await bcrypt.hash(password, salt)
            await UserModel.findByIdAndUpdate(req.user._id, { $set: { password: newHashPassword } })
            res.send({ "status": "success", "message": "Password changed succesfully" })
            console.log(req.user);
          }
        } else {
          res.send({ "status": "failed", "message": "All Fields are Required" })
        }
      }

    static loggedUser=async(req,res)=>{
        res.send({"user":req.user})
    }
    static sendUserResetEmail=async (req,res)=>{
        const {email} =req.body
        if(email){
            const secret=user._id+process.env.JWT_SECRET_KEY
            if (user){
                const user=await UserModel.findOne({email:email});
                const token=JWT.sign({userID:user._id},secret,{expiresIn:'15m'})
                const link=`http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`;
                //Send Email
                let info=await transporter.sendMail({
                    from:process.env.EMAIL_FROM,
                    to:user.email,
                    subject:"Password Reset Link",
                    html:`<a href=${link}>Click Here</a> to Reset Your Password.`
                }) 

                console.log(link);
                res.send({"status":"success","message":"Password reset email sent... please check your email","info":info})
            }else{
                res.send({"status":"failed","message":"Email field is required"})
            }
        }else{
            res.send({"status":"failed","message":"Email does'nt exists"})
        }
    }

    static userPasswordReset=async(req,res)=>{
        const {password,password_conf}=req.body
        const {id,token}=req.params
        const user=await UserModel.findById(id)
        const new_secret=user._id+process.env.JWT_SECRET_KEY
        try {
            JWT.verify(token,new_secret)
            if (password && password_conf) {
                if (password!==password_conf) {
                    res.send({"status":"failed","message":"Password and confirm password does'nt match"})
                } else {
                    const salt=await bcrypt.genSalt(10)
                    const newHashPassword=await bcrypt.hash(password,salt)
                    await UserModel.findByIdAndUpdate(user._id,{$set:{
                        password:newHashPassword
                    }})
                    res.send({"status":"failed","message":"Password reset successfullly"})
                }
            } else {
                
            }
        } catch (error) {
            res.send({"status":"failed","message":"Invalid Token"})
        }
    }
}
export default UserController