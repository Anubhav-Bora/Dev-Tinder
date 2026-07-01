const { userAuth } = require('../middlewares/auth');
const express = require('express');
const profileRouter = express.Router();
const { validateProfileEdit } = require('../utils/validation');
const User = require('../models/user');
const bcrypt = require('bcrypt');

profileRouter.get("/view",userAuth,async (req,res)=>{
    try {
        const user=req.user;
        res.status(200).send({ user });
    }
    catch(err){
        res.status(500).send("Error fetching user profile");
    }
})

profileRouter.patch("/edit", userAuth , async(req,res)=>{
    try{
        if(!validateProfileEdit(req)){
            throw new Error("Invalid Edit Request")
           // return res.status(400).send()
        }
        const user=req.user; // from userAuth
        Object.keys(req.body).forEach((key)=>{
            user[key]=req.body[key];
        })
        await user.save();
        res.json({ 
            message: "Profile updated successfully",
            data: user
         });
    }
    catch(err){
       res.status(400).send(err.message)
    }
})

 //forget password
profileRouter.patch("/forget-password", async(req,res)=>{
    try{
        const {emailId,newPassword}=req.body;
        if(!emailId || !newPassword){
            return res.status(400).send("Email and new password are required");
        }
        const user=await User.findOne({emailId});
        if(!user){
            return res.status(404).send("User not found");
        }
        const hashedPassword=await bcrypt.hash(newPassword,10);
        user.password=hashedPassword;
        await user.save();
        res.send("Password reset successfully");
    }
    catch(err){
        console.error('Error resetting password:', err);
        res.status(500).send('Error resetting password', err.message);
    }
})


module.exports=profileRouter;