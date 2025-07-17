const express = require("express");
const userAuth = require("../middlewares/auth");
const User = require("../models/user");
const getProfileRoute = express.Router();
getProfileRoute.get("/:userId", userAuth, async (req, res) => {
  try {
    // Extract userId from req.body (or adjust based on your setup)
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Fetch user profile with await
    const userProfile = await User.findById(userId).select("-password"); // Exclude sensitive fields like password
    if (!userProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(userProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = getProfileRoute;
