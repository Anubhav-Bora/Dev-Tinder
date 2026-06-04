const express = require('express');
const DBconnect = require('./config/database');
const cookieParser = require('cookie-parser');

const authRouter = require('./routers/auth');
const profileRouter = require('./routers/profile');
const requestsRouter = require('./routers/requests');

const app=express();

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/profile', profileRouter);
app.use('/requests', requestsRouter);

DBconnect().then(()=>{
    console.log('Database connected successfully');
     app.listen(3000,()=>{
     console.log('Server is running on port 3000');
 });
 
}).catch((err)=>{
    console.error('Database connection failed:', err);
});

 
