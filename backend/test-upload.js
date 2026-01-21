// Simple test script to verify Cloudinary upload
require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary Config:");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);
console.log(
  "API Secret:",
  process.env.CLOUDINARY_API_SECRET
    ? "***" + process.env.CLOUDINARY_API_SECRET.slice(-4)
    : "NOT SET",
);

// Test if config is valid
cloudinary.api
  .ping()
  .then((result) => {
    console.log("\n✓ Cloudinary connection successful!");
    console.log("Response:", result);
  })
  .catch((error) => {
    console.error("\n✗ Cloudinary connection failed!");
    console.error("Error:", error.message);
  });
