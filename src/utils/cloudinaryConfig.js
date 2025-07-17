const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Verify configuration
  if (
    !cloudinary.config().cloud_name ||
    !cloudinary.config().api_key ||
    !cloudinary.config().api_secret
  ) {
    throw new Error(
      "Cloudinary configuration is incomplete. Check environment variables."
    );
  }

  console.log("Cloudinary configured successfully");
} catch (error) {
  console.error("Cloudinary configuration failed:", error.message);
  throw error;
}

module.exports = cloudinary;
