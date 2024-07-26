const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  user: { type: String, ref: "User", required: true },
  blog: { type: String, ref: "Blog", required: true },
  createdAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model("Comment", commentSchema);

