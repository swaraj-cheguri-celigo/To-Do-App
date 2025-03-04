const mongoose = require('mongoose');

// Custom error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log error for debugging

  // Handle Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ error: "Validation Error", details: err.errors });
  }

  // Handle Invalid ObjectID errors
  if (err instanceof mongoose.Error.CastError && err.kind === "ObjectId") {
    return res.status(400).json({ error: "Invalid task ID format" });
  }

  // Handle other errors
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
