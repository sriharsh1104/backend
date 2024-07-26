const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  // comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]

},{ timestamps: true });
module.exports = mongoose.model("Blog", blogSchema);
