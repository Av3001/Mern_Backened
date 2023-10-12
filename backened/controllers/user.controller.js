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
}
export default UserController