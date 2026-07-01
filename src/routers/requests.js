const { userAuth } = require('../middlewares/auth');
const User = require('../models/user');
const ConnectionRequest = require('../models/connectionRequest');
const express = require('express');

const requestsRouter = express.Router();

requestsRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
    try{
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;
        const allowedStatus=["ignored","interested"]
        if(!allowedStatus.includes(status)){
            return res.status(400).send("Invalid status type");
        }
        //check if user present in db or not
        const toUser = await User.findById(toUserId);
        if(!toUser){
            return res.status(404).send("User not found");
        }

        // check if there is an existing request between the same users
        const existingRequest =  await ConnectionRequest.findOne({
            $or: [
                {
                    fromUserId,
                    toUserId,
                },
                {
                    fromUserId: toUserId,
                    toUserId: fromUserId,
                }
            ]
        });
        if(existingRequest){
            return res.status(400).send("Request already sent");
        }
        
        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status,
        });
        const data=await connectionRequest.save();
        res.json({
            message:"Request sent successfully",
            data,
        });
    }
    catch(err){
        res.status(400).send("Error sending request", err.message);
    }
})

requestsRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
 try{
    const loggedInUserId = req.user._id;

   // validate status
   const {status, requestId} = req.params;
   const allowedStatus=["accepted","rejected"]
   if(!allowedStatus.includes(status)){
    return res.status(400).send("Invalid status type");
   }

   const connectionRequest = await ConnectionRequest.findOne({
    _id: requestId,
    toUserId: loggedInUserId,
    status: "interested",
   });

   if(!connectionRequest){
    return res.status(404).send("Request not found");
   }

   connectionRequest.status = status;
   await connectionRequest.save();
   res.json({
       message: "Request reviewed successfully",
       data: connectionRequest,
   });
 }
 catch(err){
        res.status(400).send("Error reviewing request", err.message);
 }
})



module.exports = requestsRouter;

module.exports = requestsRouter;

