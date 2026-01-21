const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Hardcoded Admin Credentials (as per PRD "Simple JWT-based auth")
// In a real production app, use a database with hashed passwords.
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "password123"; // Change this!

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
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
