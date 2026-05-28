const express= require('express');
const DBconnect = require('./config/database');
const User = require('./models/user');
const { validateUserData } = require('./utils/validation');
const bcrypt=require("bcrypt");
const cookieParser=require("cookie-parser")
const jwt=require("jsonwebtoken")
const { userAuth } = require('./middlewares/auth');
const app=express();

app.use(express.json());
app.use(cookieParser())



app.post("/signup",async (req,res)=>{
    try{
    //validation of data 
    const validationResult=validateUserData(req);
    if(!validationResult.isValid){
        return res.status(400).send(validationResult.message);
    }
    //encrypt the password
    const {firstName,lastName,emailId,password}=req.body;
    const hashedPassword=await bcrypt.hash(password,10);
    //creating a new user instance 
    const user=new User({
        firstName,
        lastName,
        emailId,
        password:hashedPassword,
    }); 
    await user.save();
    res.send("User signed up successfully");
    }catch(err){
        console.error('Error signing up user:', err);
        res.status(500).send('Error signing up user', err.message);
    }
})

app.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            return res.status(500).send("JWT secret is not configured");
        }

        const user = await User.findOne({ emailId });

        if (!user) {
            return res.status(404).send("Wrong credentials");
        }

        const isPasswordValid = await user.validatePassword(password);

        if (isPasswordValid) {

            //create a jwt token
            const token= await user.getJwtToken();

            // then send the token through cookie to the browser
            res.cookie("token", token, { httpOnly: true });

            return res.status(200).json({ message: "Login Successful", user: { _id: user._id, emailId: user.emailId } });
        } else {
            return res.status(401).send("Wrong credentials");
        }

    } catch (err) {
        res.status(500).send("Something went wrong");
    }
});

app.get("/profile",userAuth,async (req,res)=>{
    try {
        const user=req.user;
        res.status(200).send({ user });
    }
    catch(err){
        res.status(500).send("Error fetching user profile");
    }
})

DBconnect().then(()=>{
    console.log('Database connected successfully');
     app.listen(3000,()=>{
     console.log('Server is running on port 3000');
 });
 
}).catch((err)=>{
    console.error('Database connection failed:', err);
});

 
