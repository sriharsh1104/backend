const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();
const JWT_SECRET = "your_jwt_secret_here";

// Signup route
router.post("/signup", async (req, res) => {
  const { username, password, email } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ username, password: hashedPassword, email });
    await newUser.save();

    res.status(200).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Signin route
router.post("/signin", async (req, res) => {
  const { password, email } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        status: 400,
        message: "Invalid Credentials",
        error: true 
      });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        status: 400,
        message: "Invalid Credentials",
        error: true 
      });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      status: 200,
      message: "User Login Successfull",
      token,
      error: false
    });
  } catch (err) {
    res.status(500).json({ 
      status: 500,
      message: "Server Error",
      error: err.message 
    });
  }
});
module.exports = router;
