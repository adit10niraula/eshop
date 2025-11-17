const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

// Import your Category model
const { Category } = require("./models/Category");

// Import categories data
const categories = require("./data/categories");

mongoose
  .connect(process.env.MONGO_URL)
  .then(async () => {
    console.log("MongoDB connected");

    // Clear old categories (optional)
    await Category.deleteMany({});
    console.log("Old categories removed");

    // Insert new categories
    await Category.insertMany(categories);
    console.log("Categories added successfully");

    process.exit();
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });
