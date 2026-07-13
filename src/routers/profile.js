const { userAuth } = require('../middlewares/auth');
const express = require('express');
const profileRouter = express.Router();
const { validateProfileEdit } = require('../utils/validation');
const User = require('../models/user');
const bcrypt = require('bcrypt');

profileRouter.get("/view", userAuth, async (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user profile" });
  }
});

profileRouter.patch("/edit", userAuth, async (req, res) => {
  try {
    if (!validateProfileEdit(req)) {
      return res.status(400).json({ message: "Invalid edit request: unsupported fields" });
    }
    const user = req.user;
    Object.keys(req.body).forEach((key) => {
      user[key] = req.body[key];
    });
    await user.save();
    res.json({ message: "Profile updated successfully", data: user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

profileRouter.patch("/forget-password", async (req, res) => {
  try {
    const { emailId, newPassword } = req.body;
    if (!emailId || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required" });
    }
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.send("Password reset successfully");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = profileRouter;
