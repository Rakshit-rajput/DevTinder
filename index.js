// Import Express
const express = require("express");
// Create an Express application
const app = express();
const connectDB = require("./src/config/database");
const cookieParser = require("cookie-parser");
const authRouter = require("./src/routes/authRoutes");
const profileRouter = require("./src/routes/profileRoutes");
const requestRouter = require("./src/routes/requestsRouter");
const userRouter = require("./src/routes/userRouter");
const chatRouter = require("./src/routes/chatRoutes");
const cors = require("cors");
const http = require("http");
const initializeSocket = require("./src/utils/socket");
const getProfileRouter = require("./src/routes/getProfilesRoutes");
//middlewares
app.get("/", (req, res) => {
  res.send("hello");
});
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
// Define a port
const PORT = process.env.PORT || 3000;

//auth Routes
app.use("/auth", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);
app.use("/getuserprofile", getProfileRouter);

// Start the server
const server = http.createServer(app);

initializeSocket(server);

const start = async () => {
  try {
    // Attempt to connect to the database
    await connectDB();
    console.log("Database connected successfully");

    // Start the server only after the database is connected
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    // Log the error and exit the process if the database connection fails
    console.error("Failed to connect to the database:", error);
    process.exit(1); // Exit the process with a failure code
  }
};

start();
