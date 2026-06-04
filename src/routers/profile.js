const { userAuth } = require('../middlewares/auth');
const express = require('express');

const profileRouter = express.Router();

profileRouter.get("/profile",userAuth,async (req,res)=>{
    try {
        const user=req.user;
        res.status(200).send({ user });
    }
    catch(err){
        res.status(500).send("Error fetching user profile");
    }
})

module.exports=profileRouter;