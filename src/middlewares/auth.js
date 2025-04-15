const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();
const userAuth = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    const { token } = cookies;
    if (!token) {
      throw new Error("Invalid Token");
    }
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = decodedData;
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(400).send("Error" + error);
  }
};
module.exports = {
  userAuth,
};
