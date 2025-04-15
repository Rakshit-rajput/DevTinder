// Import Express
const express = require("express");
const bcrypt = require("bcrypt");
// Create an Express application
const app = express();
const connectDB = require("./config/database");
const { default: mongoose } = require("mongoose");
const User = require("./models/user");
const { ReturnDocument } = require("mongodb");
const { validateStringData } = require("./utils/validate");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth");
app.use(express.json());
app.use(cookieParser());
// Define a port
const PORT = 3000;

app.post("/signUp", async (req, res) => {
  try {
    //validate the data
    validateStringData(req);
    const { firstName, lastName, emailId, password } = req.body;
    //encrypting the password before saving it to db
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);
    //signing up user
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    await user.save();
    res.status(200).send("User added succesfully" + passwordHash);
  } catch (error) {
    res.status(400).send("ERROR:" + error.message);
  }
});
app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      res.status(404).send("Invalid credentials");
    }
    const isPassword = await bcrypt.compare(password, user.password);
    if (isPassword) {
      //creating jwt
      const token = await jwt.sign({ _id: user._id }, "DEV@secretKey");
      res.cookie("token", token);

      //add the token to the cookie and send the response back to the user
      res.send("Login Succesful");
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (error) {
    res.status(500).send("something went wrong" + error);
  }
});
app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.send(error);
  }
});
app.get("/users", userAuth, async (req, res) => {
  try {
    const data = await User.find();
    if (data.length === 0) {
      res.status(404).send("No users found");
    }
    res.status(200).send(data);
  } catch (error) {
    console.log("Error while fetching user");
    res.status(500).send("Error fetching the data");
  }
});
app.get("/feed", async (req, res) => {
  try {
    const data = await User.find();
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send("something went wrong");
  }
});
app.get("/user", async (req, res) => {
  try {
    const userEmail = req.body.emailId; // Get emailId from query parameters
    if (!userEmail) {
      return res.status(400).send("Email ID is required");
    }

    const singleUser = await User.findOne({ emailId: userEmail });
    if (!singleUser) {
      return res.status(404).send("User not found");
    }

    res.status(200).json(singleUser); // Send user data as JSON
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send("Something went wrong");
  }
});
app.delete("/deleteuser", async (req, res) => {
  try {
    const userEmail = req.body.emailId;
    const singleUser = await User.findOne({ emailId: userEmail });
    if (!singleUser) {
      res.send(404).send("not found");
    }
    console.log(singleUser);
    User.findByIdAndDelete({ _id: singleUser._id });
    res.status(200).send("user deleted successFully");
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
});
app.patch("/updateUser", async (req, res) => {
  try {
    const emailId = req.body.emailId;
    const data = req.body;
    const user = await User.findOneAndUpdate({ emailId: emailId }, data, {
      ReturnDocument: "after",
    });
    if (!user) {
      res.status(404).send("user Not found ");
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).send("something went wrong");
  }
});

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
