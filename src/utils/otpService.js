const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const Otp = require("../models/Otp"); // Adjust the path to your Otp model
const User = require("../models/user"); // Adjust the path to your User model

// Generate and send OTP
async function generateAndSendOtp(email) {
  // Check if email is already registered
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email already registered from otpverification");
  }

  const otp = otpGenerator.generate(6, {
    digits: true,
    alphabets: false,
    upperCase: false,
    specialChars: false,
  });

  try {
    // Store OTP in the database
    await Otp.create({ email, otp, created: new Date(), verified: false });

    // Set up email transporter
    const transporter = nodemailer.createTransport({
      service: "yahoo",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Send OTP via email
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "OTP Verification",
      text: `Your OTP for Verification is: ${otp}`,
    });

    return otp; // Return OTP for logging or response
  } catch (error) {
    throw new Error("Error sending OTP: " + error.message);
  }
}

// Verify OTP
async function verifyOtp(email, otp) {
  try {
    const otpRecord = await Otp.findOne({ email, otp }).exec();
    if (otpRecord && Date.now() - otpRecord.created < 10 * 60 * 1000) {
      // 10-minute expiry
      await Otp.findOneAndUpdate({ email, otp }, { $set: { verified: true } });
      return true;
    }
    return false;
  } catch (error) {
    throw new Error("Error verifying OTP: " + error.message);
  }
}

// Check if email has a verified OTP
async function hasVerifiedOtp(email) {
  try {
    const otpRecord = await Otp.findOne({ email, verified: true })
      .sort({ created: -1 })
      .exec();
    if (otpRecord && Date.now() - otpRecord.created < 10 * 60 * 1000) {
      return true;
    }
    return false;
  } catch (error) {
    throw new Error("Error checking OTP verification: " + error.message);
  }
}

// Delete OTPs for an email
async function deleteOtps(email) {
  try {
    await Otp.deleteMany({ email });
  } catch (error) {
    throw new Error("Error deleting OTPs: " + error.message);
  }
}

module.exports = {
  generateAndSendOtp,
  verifyOtp,
  hasVerifiedOtp,
  deleteOtps,
};
