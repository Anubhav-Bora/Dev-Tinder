const jwt=require("jsonwebtoken");
const User = require('../models/user');
const userAuth = async (req,res,next)=>{
    //read the token from req cookies 
    try{
    const {token}=req.cookies;
    if(!token){
        throw new Error("Please login");
    }
    const jwtSecret = process.env.JWT_SECRET;
     
    //validate the token 
    const decoded=await jwt.verify(token, jwtSecret);
    //find the user
    const user=await User.findById(decoded._id);

    if (!user) {
        return res.status(404).send("User not found");
    }
    req.user = user;
    next();
    }catch(err){
        res.status(401).send("Invalid or expired token");
    }
}
module.exports={userAuth}; 