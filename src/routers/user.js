const express = require('express');
const UserRouter = express.Router();
const User = require('../models/user');
const ConnectionRequest = require('../models/connectionRequest');
const { userAuth } = require('../middlewares/auth');

const USER_SAFE_DATA = "firstName lastName photoUrl skills about age gender";

UserRouter.get("/feed", userAuth, async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUserId },
                { toUserId: loggedInUserId },
            ],
        }).select("fromUserId toUserId");

        const hideUsersFromFeed = new Set();
        connectionRequests.forEach((request) => {
            hideUsersFromFeed.add(request.fromUserId.toString());
            hideUsersFromFeed.add(request.toUserId.toString());
        });
        hideUsersFromFeed.add(loggedInUserId.toString());

        const users = await User.find({
            _id: { $nin: Array.from(hideUsersFromFeed) },
        }).select(USER_SAFE_DATA).skip(skip).limit(limit);

        res.json({
            message: "Feed fetched successfully",
            data: users,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

UserRouter.get("/requests/recieved", userAuth, async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        const receivedRequests = await ConnectionRequest.find({
            toUserId: loggedInUserId,
            status: "interested",
        }).populate("fromUserId", "firstName lastName photoUrl skills about age gender");

        res.json({
            message: "Received requests fetched successfully",
            data: receivedRequests,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

UserRouter.get("/users/connections", userAuth, async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        const connections = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUserId, status: "accepted" },
                { toUserId: loggedInUserId, status: "accepted" },
            ],
        }).populate("fromUserId", USER_SAFE_DATA).populate("toUserId", USER_SAFE_DATA);

        res.json({
            message: "Connections fetched successfully",
            data: connections,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = UserRouter;
