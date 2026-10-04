import jwt from "jsonwebtoken";
import {Request,Response} from "express";
import USER from "./auth.model.js";
import bcrypt from "bcrypt";
const registerUser=async (req:Request,res:Response):Promise<any>=>{
    try {
        const exitsingUser=await USER.findOne({email:req.body.email});
        if(exitsingUser) return res.status(400).json({success:false,mssg:"User Exist! Please Signin"});
        const hashPassword:string=await bcrypt.hash(req.body.password,10);
        const user=await USER.create({
            name:req.body.name,email:req.body.email,password:hashPassword
        });
        const token:string=await jwt.sign({name:user.name,email:user.email},process.env.JWT_Secret_Key as string);
        return res.status(201).json({success:true,mssg:"Account Created",token});
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,mssg:"Internal Server Down"});
    }
}

const loginUser=async (req:Request,res:Response):Promise<any>=>{
    try {
        const exitsingUser=await USER.findOne({email:req.body.email});
        if(!exitsingUser) return res.status(400).json({success:false,mssg:"User doesn't exist! Please Signup"});
        const hashPassword:boolean=await bcrypt.compare(req.body.password,exitsingUser.password);
        if(!hashPassword) return res.status(400).json({success:false,mssg:"Invalid Email or Password"});
        const token:string=await jwt.sign({name:exitsingUser.name,email:exitsingUser.email,_id:exitsingUser._id},process.env.JWT_Secret_Key as string);
        return res.status(201).json({success:true,mssg:"Logged In!",token});
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,mssg:"Internal Server Down"});
    }
}

export {registerUser,loginUser};