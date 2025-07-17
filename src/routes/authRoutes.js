const express = require("express");
const authRouter = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const otpService = require("../utils/otpService");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { validateStringData } = require("../utils/validate");
const Otp = require("../models/Otp");
const userAuth = require("../middlewares/auth");
require("dotenv").config();
const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
const api_key = process.env.CLOUDINARY_API_KEY;
const api_secret = process.env.CLOUDINARY_API_SECRET;
// Configure Multer for file uploads with validation
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only images are allowed"));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
//opt generate
authRouter.post("/otpgenerate", async (req, res, next) => {
  const { email } = req.body;

  try {
    const isemailAlreadyPresent = await User.findOne({ email });
    if (isemailAlreadyPresent) {
      res.status(400).send("email already Present");
    }
    const otp = await otpService.generateAndSendOtp(email);
    res.status(200).send(`message Sent successFully ${otp}`);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error sending OTP");
  }
});

//verify OTP
authRouter.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const isValid = await otpService.verifyOtp(email, otp);
    if (isValid) {
      res.status(200).send("OTP verified Successfully");
    } else {
      res.status(400).send("Invalid OTP");
    }
  } catch (error) {
    console.log("errror");
    res.status(500).send("Error verifying OTP");
  }
});

// Sign Up with Image Upload
authRouter.post("/signUp", upload.single("image"), async (req, res) => {
  try {
    validateStringData(req);
    const { firstName, lastName, emailId, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).send("ERROR: Email already registered");
    }

    // Check if OTP is valid and verified
    // const otpRecord = await Otp.findOne({ email, otp, verified: true }).exec();
    // console.log("OTP Record in /signUp:", otpRecord);
    // if (!otpRecord || Date.now() - otpRecord.created >= 10 * 60 * 1000) {
    //   return res.status(400).send("ERROR: Invalid or unverified OTP");
    // }

    // Upload image to Cloudinary if provided
    let imageUrl = "";
    if (req.file) {
      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "devtinder_users" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });
        imageUrl = result.secure_url;
      } catch (uploadError) {
        throw new Error(
          "Failed to upload image to Cloudinary: " + uploadError.message
        );
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      firstName,
      lastName,
      emailId: emailId, // Match User schema
      password: passwordHash,
      image: imageUrl,
    });

    await user.save();

    // Delete OTP records for this email
    // await otpService.deleteOtps(emailId);

    // Generate JWT token
    const token = await user.getJWT();
    res.cookie("token", token, { httpOnly: true });

    res.status(200).send({ message: "User added successfully", user });
  } catch (error) {
    console.error("Signup error:", error);
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
// Reset Password
authRouter.patch("/resetPassword", async (req, res) => {
  try {
    // validateResetPasswordData(req);
    const { email, otp, password } = req.body;

    console.log("Reset password request:", { email, otp });

    // Check if user exists
    const user = await User.findOne({ emailId: email });
    if (!user) {
      return res.status(400).send("ERROR: User not found");
    }

    // Check if OTP is valid and verified
    const otpRecord = await Otp.findOne({ email, otp, verified: true }).exec();
    console.log("OTP Record in /resetPassword:", otpRecord);
    if (!otpRecord || Date.now() - otpRecord.created >= 10 * 60 * 1000) {
      return res.status(400).send("ERROR: Invalid or unverified OTP");
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user's password
    await User.findByIdAndUpdate(user._id, {
      $set: { password: passwordHash },
    });

    // Delete OTP records for this email
    await otpService.deleteOtps(email);

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(400).send("ERROR: " + error.message);
  }
});

module.exports = authRouter;
