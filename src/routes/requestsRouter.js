const express = require("express");
const requestRouter = express.Router();
const User = require("../models/user");
const mongoose = require("mongoose");
const userAuth = require("../middlewares/auth");
const ConnectionRequestModel = require("../models/connectionRequest");
const { status } = require("express/lib/response");
requestRouter.post("/request/:status/:touserId", userAuth, async (req, res) => {
  try {
    const toUserId = req.params.touserId;
    const status = req.params.status;
    const fromUserId = req.user._id;
    const allowedStatus = ["ignored", "interested"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status Type " + status });
    }
    //checking is toUserid is same as FromUserId
    // if (mongoose.Types.ObjectId(toUserId).equals(fromUserId)) {
    //   return res
    //     .status(400)
    //     .json({ message: "Can not send request to yourself" });
    // }

    const isToUserPresent = await User.findById(toUserId);
    if (!isToUserPresent) {
      return res.status(400).json({ message: "User does not exists" });
    }
    //if there is already connection request present
    const existingConnectionRequest = await ConnectionRequestModel.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });
    if (existingConnectionRequest) {
      res.status(400).send({ message: "Connection Request Already Exists" });
    }
    const connectionRequest = new ConnectionRequestModel({
      fromUserId,
      toUserId,
      status,
    });
    const data = await connectionRequest.save();
    res.json({
      message:
        req.user.firstName +
        " " +
        status +
        " " +
        "in" +
        " " +
        isToUserPresent.firstName,
      data,
    });
  } catch (error) {
    res.send(error);
  }
});

// requestRouter.post(
//   "/request/review/:status/:requestId",
//   userAuth,
//   async (req, res) => {
//     try {
//       const { requestId, status } = req.params; // Correct destructuring
//       const loggedInUser = req.user;
//       const allowedStatus = ["accepted", "rejected"];

//       // Validate the status
//       if (!allowedStatus.includes(status)) {
//         return res.status(400).json({ message: "Status not allowed!" });
//       }

//       // Find the connection request with the given conditions
//       const connectionRequest = await ConnectionRequestModel.findOne({
//         _id: requestId,
//         status: "interested",
//         toUserId: loggedInUser._id,
//       });

//       // If no matching connection request is found
//       if (!connectionRequest) {
//         return res.status(400).json({ message: "No such request present" });
//       }

//       // Update the status and save the document
//       connectionRequest.status = status;
//       const data = await connectionRequest.save();

//       // Send a success response
//       res
//         .status(200)
//         .json({ message: `Connection request ${status} successfully`, data });
//     } catch (error) {
//       res
//         .status(500)
//         .json({ message: "Internal Server Error", error: error.message });
//     }
//   }
// );
requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const requestId = req.params.requestId;
      const status = req.params.status;

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ messaage: "Status not allowed!" });
      }

      const connectionRequest = await ConnectionRequestModel.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });
      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: "Connection request not found" });
      }

      connectionRequest.status = status;

      const data = await connectionRequest.save();

      res.json({ message: "Connection request " + status, data });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  }
);

module.exports = requestRouter;
