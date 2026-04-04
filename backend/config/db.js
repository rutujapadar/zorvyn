const mongoose = require("mongoose");
require('dotenv').config(); // MUST have this at the top!

const connectDB = async () => {
  try {
    // Use the Atlas URI from .env
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas!");
  } catch (error) {
    console.error("Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;