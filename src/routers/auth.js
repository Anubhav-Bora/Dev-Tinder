const { validateUserData, validateLoginData } = require('../utils/validation');
const User = require('../models/user');
const bcrypt = require("bcrypt");
const express = require('express');
const { userAuth } = require('../middlewares/auth');

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    const validationResult = validateUserData(req);
    if (!validationResult.isValid) {
      return res.status(400).send(validationResult.message);
    }
    const { firstName, lastName, emailId, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ firstName, lastName, emailId, password: hashedPassword });
    await user.save();
    res.send("User signed up successfully");
  } catch (err) {
    res.status(500).send(err.message || "Error signing up user");
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const validationResult = validateLoginData(req);
    if (!validationResult.isValid) {
      return res.status(400).send(validationResult.message);
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).send("JWT secret is not configured");
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(401).send("Wrong credentials");
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).send("Wrong credentials");
    }

    const token = await user.getJwtToken();
    res.cookie("token", token, { httpOnly: true });

    const userData = user.toObject();
    delete userData.password;

    return res.status(200).json({ message: "Login Successful", user: userData });
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
});

authRouter.post("/logout", userAuth, async (req, res) => {
  res.cookie("token", null, { httpOnly: true, maxAge: 0 });
  res.status(200).send("Logout successful");
});

module.exports = authRouter;
