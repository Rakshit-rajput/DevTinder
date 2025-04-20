const express = require("express");
const userRouter = express.Router();
const User = require("../models/user");
const ConnectionRequestModel = require("../models/connectionRequest");
const userAuth = require("../middlewares/auth");

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  //get all the pending requests for user
  try {
    const user = req.user;
    const userId = user._id;
    const requests = await ConnectionRequestModel.find({
      toUserId: userId,
      status: "interested",
    }).populate("fromUserId", ["firstName", "lastName"]);
    if (!requests) {
      return res.status(400).json({ message: "No Requests found" });
    }
    res.status(200).send(requests);
  } catch (error) {
    res.status(500).send("Error", error);
  }
});
userRouter.get("/user/requests/connections", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const userId = user._id;

    const connections = await ConnectionRequestModel.find({
      $or: [
        { toUserId: userId, status: "accepted" },
        { fromUserId: userId, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connections.map((row) => {
      if (row.fromUserId._id.toString() === userId.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.status(200).json({ message: data });
  } catch (error) {
    console.error("Error fetching connections:", error);
    res.status(500).send("Some error occurred: " + error.message);
  }
});
userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const connectionRequests = await ConnectionRequestModel.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId  toUserId");

    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.json({ data: users });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
module.exports = userRouter;
