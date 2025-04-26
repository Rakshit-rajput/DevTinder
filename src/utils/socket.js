const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");

const getSecretRoomId = (userId1, userId2) => {
  return crypto
    .createHash("sha256")
    .update([userId1, userId2].sort().join("$"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ firstName, userId, toUserId }) => {
      const room = getSecretRoomId(userId, toUserId);
      console.log(`${firstName} joined Room: ${room}`);
      socket.join(room);
    });

    socket.on("sendMessage", async ({ firstName, userId, toUserId, text }) => {
      const room = getSecretRoomId(userId, toUserId);
      console.log(`${firstName}: ${text}`);

      try {
        let chat = await Chat.findOne({
          participants: { $all: [userId, toUserId] },
        });

        if (!chat) {
          chat = new Chat({
            participants: [userId, toUserId],
            messages: [],
          });
        }

        chat.messages.push({
          senderId: userId,
          text,
        });

        await chat.save(); // ✅ Save chat after message is added
      } catch (error) {
        console.error("Error saving message:", error);
      }

      // Emit message to the room, but NOT to the sender
      socket.to(room).emit("messageRev", {
        firstName,
        text,
        from: userId, // Add sender's ID for differentiation
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

module.exports = initializeSocket;
