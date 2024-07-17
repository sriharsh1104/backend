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
  const userId = req.user._id; // Assuming req.user contains the authenticated user

  try {
    const filter = {};
    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    let blogs = await Blog.find(filter)
      .populate("likedBy", "username")
      .sort({ createdAt: -1 });

    // Add a field to check if the current user has liked each blog
    blogs = blogs.map((blog) => {
      const userLiked = blog.likedBy.some((user) => user.equals(userId));
      return {
        ...blog._doc,
        userLiked,
      };
    });

    if (blogs.length === 0) {
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
router.put("/updateBlog", auth, async (req, res) => {
  const { title, description } = req.body;

  try {
    // Find the blog post by ID
    const blog = await Blog.findById(req.body.id);

    // Check if the blog post exists and if the user is the owner
    if (!blog || blog.user.toString() !== req.user.toString()) {
      return res
        .status(404)
        .json({ message: "Blog post not found or unauthorized" });
    }

    // Update the blog post
    blog.title = title;
    blog.description = description;

    await blog.save();
    res.status(200).json({
      error: false,
      message: "Blog Edited Successfully",
      status: RESPONSES.SUCCESS,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: RESPONSES.INTERNALSERVER,
      error: true,
    });
  }
});

// Delete a  blog post
router.delete("/deleteBlog", auth, async (req, res) => {
  try {
    // Find the blog post by ID
    const blog = await Blog.findById(req.body.id);

    // Check if the blog post exists and if the user is the owner
    if (!blog || blog.user.toString() !== req.user.toString()) {
      return res.status(404).json({
        message: "Blog post not found or unauthorized",
        status: RESPONSES.NOTFOUND,
        error: true,
      });
    }

    await blog.deleteOne();
    res.status(200).json({
      error: false,
      message: "Blog post deleted successfully",
      status: RESPONSES.SUCCESS,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: true,
      status: RESPONSES.INTERNALSERVER,
    });
  }
});
router.post("/likePost", auth, async (req, res) => {
  const { id } = req.body;
  const userId = req.user;

  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        status: 404,
        message: "Post not found",
        error: true,
      });
    }

    // Check if the user has already liked the post
    if (blog.likedBy.includes(userId)) {
      return res.status(400).json({
        status: 400,
        message: "User has already liked this post",
        error: true,
      });
    }

    // Increment the likes count and add the user to the likedBy array
    blog.likes += 1;
    blog.likedBy.push(userId);
    await blog.save();

    res.json({
      status: 200,
      message: "Post liked successfully",
      error: false,
      data: blog,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Server error",
      error: RESPONSES.INTERNALSERVER,
    });
  }
});

module.exports = router;
