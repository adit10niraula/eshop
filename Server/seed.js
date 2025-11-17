const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

// Import your Product model
const { Product } = require("./models/Product");

// Import products data
const products = require("./data/products");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(async () => {
    console.log("MongoDB connected");

    // Optional: delete existing products
    await Product.deleteMany();

    // Insert products
    await Product.insertMany(products);
    console.log("Products added successfully");

    process.exit();
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });
