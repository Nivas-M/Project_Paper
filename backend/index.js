require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Routes
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const auth = require("./middleware/auth");

app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("CampusPrint API is Running");
});

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
