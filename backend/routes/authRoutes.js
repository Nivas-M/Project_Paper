const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

  // Use environment variables for admin credentials
  const validUsername = process.env.ADMIN_USERNAME || "admin";
  const validPassword = process.env.ADMIN_PASSWORD || "password123";

  if (username === validUsername && password === validPassword) {
    const token = jwt.sign(
      { username: ADMIN_USERNAME },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    return res.json({ token });
  }

  res.status(401).json({ message: "Invalid Credentials" });
});

module.exports = router;
