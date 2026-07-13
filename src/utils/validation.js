const validator = require("validator");

const validateUserData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName || !lastName || !emailId || !password) {
    return { isValid: false, message: "All fields are required" };
  }
  if (!validator.isEmail(emailId)) {
    return { isValid: false, message: "Invalid email format" };
  }
  if (!validator.isStrongPassword(password)) {
    return { isValid: false, message: "Password must be at least 8 characters and include uppercase, lowercase, numbers, and symbols" };
  }
  return { isValid: true, message: "Validation successful" };
};

const validateLoginData = (req) => {
  const { emailId, password } = req.body;
  if (!emailId || !password) {
    return { isValid: false, message: "Email and password are required" };
  }
  if (!validator.isEmail(emailId)) {
    return { isValid: false, message: "Invalid email format" };
  }
  return { isValid: true, message: "Validation successful" };
};

const validateProfileEdit = (req) => {
  const allowedFields = ["firstName", "lastName", "emailId", "about", "photoUrl", "gender", "age", "skills"];
  return Object.keys(req.body).every((field) => allowedFields.includes(field));
};

module.exports = { validateUserData, validateLoginData, validateProfileEdit };
