const validator = require("validator");
const { validate } = require("../models/user");
const validateStringData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error("Name is not valid");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is Not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password not strong");
  }
};
module.exports = {
  validateStringData,
};
