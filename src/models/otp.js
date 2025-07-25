const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  created: { type: Date, required: true },
  verified: { type: Boolean, default: false },
});
const Otp = mongoose.model("Otp", otpSchema);
module.exports = mongoose.model("Otp", otpSchema);
