// Import Express
const express = require("express");

// Create an Express application
const app = express();

// Define a port
const PORT = 3000;

// Define a basic route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});
app.get("/about", (req, res) => {
  res.send("About Page");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
