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

      const blog = await newBlog.save();
      res.status(201).json(blog);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
});
// Get blog data for display (Authenticated)
router.get("/getBlogData", auth, async (req, res) => {
  try {
    const blogs = await Blog.find({ user: req.user }).populate(
      "user",
      "username"
    );
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
//blog for dashboard
router.get("/", auth, async (req, res) => {
  try {
    const blogs = await Blog.find().populate("user", "username");
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
// Update a blog post
router.put("/:id", auth, async (req, res) => {
  const { title, description } = req.body;

  try {
    // Find the blog post by ID
    const blog = await Blog.findById(req.params.id);

    // Check if the blog post exists and if the user is the owner
    if (!blog || blog.user.toString() !== req.user.toString()) {
      return res
        .status(404)
        .json({ message: "Blog post not found or unauthorized" });
    }

    // Update the blog post
    blog.title = title;
    blog.description = description;

    const updatedBlog = await blog.save();
    res.json(updatedBlog);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete a  blog post
router.delete("/:id", auth, async (req, res) => {
  try {
    // Find the blog post by ID
    const blog = await Blog.findById(req.params.id);

    // Check if the blog post exists and if the user is the owner
    if (!blog || blog.user.toString() !== req.user.toString()) {
      return res
        .status(404)
        .json({ message: "Blog post not found or unauthorized" });
    }

    await blog.deleteOne();
    res.json({ message: "Blog post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
