const express= require('express');
const connectDB=require('./config/database');
const DBconnect = require('./config/database');
const User = require('./models/user');
const { validateUserData } = require('./utils/validation');
const bcrypt=require("bcrypt");
const cookieParser=require("cookie-parser")
const jwt=require("jsonwebtoken")
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

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (isPasswordValid) {

            //create a jwt token
            const token=jwt.sign({_id:user._id}, jwtSecret)
    
            // then send the token through cookie to the browser
            res.cookie("token", token)

            return res.status(200).send("Login Successful");
        } else {
            return res.status(401).send("Wrong credentials");
        }

    } catch (err) {
        res.status(500).send("Something went wrong");
    }
});

app.get("/profile",async (req,res)=>{
    try {
        const {token}=req.cookies;
        const jwtSecret = process.env.JWT_SECRET;

        if (!token) {
            return res.status(401).send("Please login");
        }

        if (!jwtSecret) {
            return res.status(500).send("JWT secret is not configured");
        }

        //validate the token 
        const decoded=jwt.verify(token, jwtSecret);
        const user=await User.findById(decoded._id);

        if (!user) {
            return res.status(404).send("User not found");
        }
     
        res.send(user);
    } catch (err) {
        res.status(401).send("Invalid or expired token");
    }
})

//find by email id and return the user details
app.get("/user",async(req,res)=>{
        const usersMail=req.body.emailId;
        try{
            const user=await User.findOne({emailId:usersMail});
            if(!user){
                return res.status(404).send("User not found");
            }
            res.json(user);
        }catch(err){
            console.error('Error fetching user:', err);
            res.status(500).send('Error fetching user');
        }
})
//fetching all the users from the database and return them as a response
app.get("/feed", async (req, res) => {
    try {
        const users = await User.find({});

        res.status(200).json({
            message: "Users fetched successfully",
            data: users
        });

    } catch (err) {
        res.status(500).json({
            message: "Error fetching users",
            error: err.message
        });
    }
});

//delete user by id
app.delete("/user", async (req,res)=>{
    const userId=req.body.userId;
    try{
        const user=await User.findOneAndDelete(userId);
        res.send("User deleted successfully")
    }
    catch(err){
         console.error('Error fetching user:', err);
         res.status(500).send('Error deleting user');
    }
})

//update
app.patch("/user/:userId", async (req, res) => { //: means dynamic, I am taking userId from params otherr I have to put userId in allowed too 
    const userId = req.params?.userId;
    const data = req.body;
    const allowedUpdate=["photourl","age","skills","about","firstName","lastName"]; 
    const isAllowed=Object.keys(data).every((k)=>  //only allow certain data to update 
        allowedUpdate.includes(k)
    );
    if(!isAllowed){
        throw new Error("Update not allowed");
    }
    if(data?.length>10){
        throw new Error("Skills should be less than 10");
    }
    try {
        const user = await User.findByIdAndUpdate(
            userId,
            data,
            {
                returnDocument: "after", 
                runValidators: true,    // this is allow to use validor from schema even during updating data 
            }
        );
        res.send({
            message: "Data updated successfully",
            data: user,
        });
    } catch (err) {
        res.status(500).send("Error updating user");
    }
});

DBconnect().then(()=>{
    console.log('Database connected successfully');
     app.listen(3000,()=>{
     console.log('Server is running on port 3000');
 });
 
}).catch((err)=>{
    console.error('Database connection failed:', err);
});

 
