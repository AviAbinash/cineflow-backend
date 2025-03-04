import express from "express";
//hash passwords before storing in db
import bcrypt from "bcryptjs";
//generate jwt token for authentication
import jwt from "jwt";

import UserModel from "../models/userModel";
import { tryCatch } from "bullmq";

// create a new express router
const authRouter = express.Router();

// register user API

authRouter.post("/register", async (req, res, next) => {
  // extract user details from req body
  try {
    const { name, email, password } = req.body;
    const hahedPassword = await bcrypt.hash(password, 10);
    // create a new user
    const user = new UserModel({ name, email, password });
    // save user to database
    await user.save();
    res.json({ status: 201, message: "user regsiter successfully" });
  } catch {
    res.status(500).json({ message: "something went wrong" });
  }
});


authRouter.post("/login",async(req,res)=>{
   const {email,password} = req.body
   const user =  await UserModel.findOne({email})
   if(!user){
   return res.status(404).json({message:"user not found"})
   }
   const isCompare = await bcrypt.compare(user?.password,password)
   if(!isCompare){
    return res.status(401).json({message:"password is wrong"})

   }
   const token  = await jwt.sign({id:user?._id,email:user?.email},process.env.JWT_SECERT,{expiresIn:"7d"})
   res.status(200).json({token,user,message:"login successfull"})
})


export default authRouter