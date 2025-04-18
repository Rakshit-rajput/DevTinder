const express = require("express");
const profileRouter = express.Router();
const userAuth = require("../middlewares/auth");
const User = require("../models/user");
const {
  validateStringData,
  validateEditProfile,
} = require("../utils/validate");

profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfile(req)) {
      throw new Error("Invalid Edit Request");
    }
    const _id = req.user._id;
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("No user found");
    }

    Object.keys(req.body).forEach((key) => (user[key] = req.body[key]));
    await user.save();
    res.json({
      message: `${user.firstName}, your profile is updated successfully`,
      data: user,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});
module.exports = profileRouter;
