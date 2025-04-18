// Import Express
const express = require("express");
// Create an Express application
const app = express();
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/authRoutes");
const profileRouter = require("./routes/profileRoutes");
const requestRouter = require("./routes/requestsRouter");
const userRouter = require("./routes/userRouter");
//middlewares
app.use(express.json());
app.use(cookieParser());
// Define a port
const PORT = 3000;

//auth Routes
app.use("/auth", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

// Start the server

const start = async () => {
  try {
    // Attempt to connect to the database
    await connectDB();
    console.log("Database connected successfully");

    // Start the server only after the database is connected
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    // Log the error and exit the process if the database connection fails
    console.error("Failed to connect to the database:", error);
    process.exit(1); // Exit the process with a failure code
  }
};

start();
