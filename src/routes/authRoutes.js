const express = require("express");
const authRouter = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { validateStringData } = require("../utils/validate");
authRouter.post("/signUp", async (req, res) => {
  try {
    //validate the data
    validateStringData(req);
    const { firstName, lastName, emailId, password } = req.body;
    //encrypting the password before saving it to db
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);
    //signing up user
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    await user.save();
    res.status(200).send("User added succesfully" + passwordHash);
  } catch (error) {
    res.status(400).send("ERROR:" + error.message);
  }
});
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    // Find user by email
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      return res.status(404).send("Invalid credentials"); // Return to stop further execution
    }

    // Compare passwords
    const isPassword = await user.validatePassword(password);
    if (isPassword) {
      // Generate JWT token
      const token = await user.getJWT();

      // Set token in cookies
      res.cookie("token", token);

      // Send success response
      return res.send("Login Successful");
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (error) {
    res.status(500).send("Something went wrong: " + error.message);
  }
});
authRouter.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.send("Logout successful");
});
module.exports = authRouter;
