const express = require("express");
const { Chat } = require("../models/chat");
const userAuth = require("../middlewares/auth");

const chatRouter = express.Router();

// Get or create chat between logged-in user and target user
chatRouter.get("/chat/:toUserId", userAuth, async (req, res) => {
  const { toUserId } = req.params;
  const userId = req.user._id;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, toUserId] },
    })
      .populate({
        path: "messages.senderId",
        model: "User", // <--- explicitly mention model
        select: "firstName lastName",
      })
      .exec();

    if (!chat) {
      chat = new Chat({
        participants: [userId, toUserId],
        messages: [],
      });
      await chat.save();
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = chatRouter;
