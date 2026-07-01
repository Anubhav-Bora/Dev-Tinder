const express = require('express');
const UserRouter = express.Router();
const User = require('../models/user');
const ConnectionRequest = require('../models/connectionRequest');
const { userAuth } = require('../middlewares/auth');

const USER_SAVE_DATA = "firstName lastName photoUrl skills about";

UserRouter.get("/requests/recieved", userAuth, async (req, res) => {
    try{
        const loggedInUserId = req.user._id;
        const receivedRequests =  await ConnectionRequest.find({ 
            toUserId: loggedInUserId,
            status: "interested",
         }).populate("fromUserId", ["firstName", "lastName", "photoUrl", "skills", "about"]);

         res.json({
            message:"Received requests fetched successfully",
            data: receivedRequests,
         });    

    }
    catch(err){
        res.status(400).send("Error fetching received requests", err.message);
    }   
})

UserRouter.get("/users/connections", userAuth, async (req, res) => {
    try{
        const loggedInUserId = req.user._id;
        const connections =  await ConnectionRequest.find({ 
            $or: [
                {
                    fromUserId: loggedInUserId,
                    status: "accepted",
                },
                {
                    toUserId: loggedInUserId,
                    status: "accepted",
                }
            ]
         }).populate("toUserId",USER_SAVE_DATA).populate("fromUserId",USER_SAVE_DATA);

         const data = connections.map((connection) => {
            if(connection.fromUserId._id.toString() === loggedInUserId.toString()){
                return connection.toUserId;
            }
            else{
                return connection.fromUserId;
            }
         }); 

         res.json({
            message:"Connections fetched successfully",
            data: connections,
         });    
    }
    catch(err){
        res.status(400).send("Error fetching connections", err.message);
    }   
})

UserRouter.get("/feed", userAuth, async (req, res) => {
    try{
        const loggedInUserId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUserId },
                { toUserId: loggedInUserId },
            ],
        }).select("fromUserId toUserId").skip((page - 1) * limit).limit(limit);
        const hideUsersfromFeed = new Set();
        connectionRequests.forEach((request) => {
            hideUsersfromFeed.add(request.fromUserId.toString());
            hideUsersfromFeed.add(request.toUserId.toString());
        });
        hideUsersfromFeed.add(loggedInUserId.toString());
        const users = await User.find({
            $and:[{_id: { $nin: Array.from(hideUsersfromFeed) }},
                {$ne: { _id: loggedInUserId }},
            ]
        }).select(USER_SAVE_DATA).skip(skip).limit(limit); //skip=(page - 1) * limit
        res.json({
            message: "Feed fetched successfully",
            data: users,
        });
    }
    catch(err){
        res.status(400).json({
            message: err.message,
        })
    }
}); 

module.exports=UserRouter;