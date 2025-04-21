const express = require("express");
const authRouter = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { validateStringData } = require("../utils/validate");
authRouter.post("/signUp", async (req, res) => {
  try {
    validateStringData(req);
    const { firstName, lastName, emailId, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    await user.save();

    // Generate JWT token
    const token = await user.getJWT();
    res.cookie("token", token);

    res.status(200).send({ message: "User added successfully", user });
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
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
      return res.send(user);
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (error) {
    res.status(500).send("Something went wrong: " + error.message);
  }
});
authRouter.post("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("Logout Successful!!");
});
authRouter.post("/forgetPassword", async (req, res) => {
  res.send("Password reset");
});
module.exports = authRouter;
