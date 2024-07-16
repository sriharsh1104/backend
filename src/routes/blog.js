const express = require("express");
const Blog = require("../models/blog");
const auth = require("../middleware/auth");
const User = require("../models/user");
const { createBlogSchema } = require("../joiValidation/validation");
const { RESPONSES } = require("../response/response");

const router = express.Router();

// Create a new blog post
router.post("/createBlog", auth, async (req, res) => {
  const { title, description } = req.body;
  const existingUser = await User.findOne({ _id: req.user });
  const { error } = createBlogSchema.validate({ title, description });
  if (error) {
    return res.status(INVALID_REQ).json({
      status: RESPONSES.INVALID_REQ,
      message: "Blog Is SuccessFully Created",
      error: true,
    });
  }
  if (existingUser) {
    try {
      const newBlog = new Blog({
        title,
        description,
        user: req.user,
      });

      const blog = await newBlog.save();
      res.status(200).json({ status: 200, error: false, blog });
    } catch (error) {
      res.status(500).json({
        message: "Title Already Exist",
        status: RESPONSES.INVALID_REQ,
        error: true,
      });
    }
  }
});
// Get blog data for display (Authenticated)
router.get("/getBlogData", auth, async (req, res) => {
  const { title } = req.query;
  try {
    const filter = { user: req.user };
    let blogs;
    // If a title query parameter is provided, add it to the filter
    if (title) {
      filter.title = { $regex: title, $options: "i" };
      blogs = await Blog.find(filter).sort({ createdAt: -1 });
    } else {
      blogs = await Blog.find(filter)
        // .populate("useruserSpecifiedBlog", "username")
        .sort({ createdAt: -1 });
    }
    if (blogs?.length === 0) {
      return res.status(200).json({
        status: 200,
        message: "Data fetched successfully, but no data found",
        error: false,
        data: blogs,
      });
    }
    res.json({
      status: 200,
      message: "Data fetched successfully",
      error: false,
      data: blogs,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Server error",
      error: err.message,
    });
  }
});
//blog for dashboard
router.get("/getBlogDashboard", auth, async (req, res) => {
  const { title } = req.query;

  try {
    const filter = { title };
    let blogs;
    // If a title query parameter is provided, add it to the filter
    if (title) {
      filter.title = { $regex: title, $options: "i" };
      blogs = await Blog.find().sort({ createdAt: -1 });
    } else {
      blogs = await Blog.find()
        // .populate("useruserSpecifiedBlog", "username")
        .sort({ createdAt: -1 });
    }
    if (blogs?.length === 0) {
      return res.status(200).json({
        status: 200,
        message: "Data fetched successfully, but no data found",
        error: false,
        data: blogs,
      });
    }
    res.json({
      status: 200,
      message: "Data fetched successfully",
      error: false,
      data: blogs,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Server error",
      error: err.message,
    });
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
router.delete("/deleteBlog", auth, async (req, res) => {
  try {
    // Find the blog post by ID
    const blog = await Blog.findById(req.body.id);

    // Check if the blog post exists and if the user is the owner
    if (!blog || blog.user.toString() !== req.user.toString()) {
      return res
        .status(404)
        .json({
          message: "Blog post not found or unauthorized",
          status: RESPONSES.NOTFOUND,
          error: true,
        });
    }

    await blog.deleteOne();
    res
      .status(200)
      .json({
        error: false,
        message: "Blog post deleted successfully",
        status: RESPONSES.SUCCESS,
      });
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Server error",
        error: true,
        status: RESPONSES.INTERNALSERVER,
      });
  }
});

module.exports = router;
