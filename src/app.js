const express= require('express');
const connectDB=require('./config/database');
const DBconnect = require('./config/database');
const User = require('./models/user');
const app=express();



app.post("/signup",async (req,res)=>{
    const user=new User({
        firstName:"Anubhav",
        lastName:"Bora",
        emailId:"anubhav123@gmail.com",
        password:"password123",
        age:25,
        gender:"Male"
    })
    try{
    await user.save();
    res.send("User signed up successfully");
    }catch(err){
        console.error('Error signing up user:', err);
        res.status(500).send('Error signing up user');
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

 
