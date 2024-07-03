const express = require("express");
const Blog = require("../models/blog");
const auth = require("../middleware/auth");
const User = require("../models/user");

const router = express.Router();

// Create a new blog post
router.post("/createBlog", auth, async (req, res) => {
  const { title, description } = req.body;
  const existingUser = await User.findOne({ _id: req.user });
  if (existingUser) {
    try {
      const newBlog = new Blog({
        title,
        description,
        user: req.user,
      });
      console.log("req.user", req.user);

      const blog = await newBlog.save();
      res.status(201).json(blog);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
});
// Create a new blog post
router.get("/getBlogData", auth, async (req, res) => {
  const { title, description } = req.body;
  const existingUser = await User.findOne({ _id: req.user });
  if (existingUser) {
    try {
      const newBlog = new Blog({
        title,
        description,
        user: req.user,
      });
      console.log("req.user", req.user);

      const blog = await newBlog.save();
      res.status(201).json(blog);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
});

module.exports = router;
