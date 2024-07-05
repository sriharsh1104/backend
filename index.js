const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./src/routes/user");
const blogRoutes = require("./src/routes/blog");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = "mongodb://localhost:27017/blog_data";

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/blog", blogRoutes);

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, {})
  .then(() => {
    console.log("Connected to MongoDB");
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
