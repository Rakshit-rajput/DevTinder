const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // Ensure this field is required
      ref: "User", // Reference the User model
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // Ensure this field is required
      ref: "User", // Reference the User model
    },
    status: {
      type: String,
      enum: ["ignore", "interested", "accepted", "rejected"], // Valid values
      required: true, // Ensure this field is required
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);
connectionSchema.index({ fromUserId: 1, toUserId: 1 });
// connectionSchema.pre("save", function () {
//   const connectionRequest = this;
//   //check if from to toUserid is same
//   if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
//     return next(Error("Cannot send Connection to yourself"));
//   }
//   next();
// });

const ConnectionRequestModel = mongoose.model(
  "connectionRequest",
  connectionSchema
);

module.exports = ConnectionRequestModel;
