const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Use environment variables for admin credentials
  const validUsername = process.env.ADMIN_USERNAME || "admin";
  const validPassword = process.env.ADMIN_PASSWORD || "password123";

  if (username === validUsername && password === validPassword) {
    const token = jwt.sign(
      { username: validUsername },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    return res.json({ token });
  }

  res.status(401).json({ message: "Invalid Credentials" });
});

module.exports = router;
