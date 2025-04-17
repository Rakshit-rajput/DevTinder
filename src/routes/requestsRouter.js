const express = require("express");
const requestRouter = express.Router();
const User = require("../models/user");

const userAuth = require("../middlewares/auth");
requestRouter.post("/sendConnectionReq", userAuth, (req, res) => {
  try {
    res.send("Connection req sent");
  } catch (error) {
    res.send(error);
  }
});
// requestRouter.get("/feed", async (req, res) => {
//   try {
//     const data = await User.find();
//     res.status(200).send(data);
//   } catch (error) {
//     res.status(500).send("something went wrong");
//   }
// });
module.exports = requestRouter;
