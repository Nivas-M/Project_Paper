const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Order = require("../models/Order");
const { upload } = require("../config/cloudinary");
const pdf = require("pdf-parse");
const axios = require("axios");
const auth = require("../middleware/auth.js");

// 1. Route to handle File Upload & Page Counting
router.post(
  "/upload",
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        console.error("=== MULTER/CLOUDINARY ERROR ===");
        console.error("Error:", err);
        return res.status(500).json({
          message: "Error uploading file to cloud",
          error: err.message,
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = req.file.path;
      console.log(`File uploaded to: ${fileUrl}`);

      let pageCount = 0;

      // Only parse page count if it is a PDF
      if (req.file.mimetype === "application/pdf" || fileUrl.endsWith(".pdf")) {
        console.log("Fetching PDF for parsing...");

        // Fetch the file content from Cloudinary URL
        const response = await axios.get(fileUrl, {
          responseType: "arraybuffer",
        });

        const buffer = Buffer.from(response.data);
        const data = await pdf(buffer);
        pageCount = data.numpages;

        console.log(`PDF Parsed. Page Count: ${pageCount}`);
      }

      res.json({
        fileUrl: fileUrl,
        fileName: req.file.originalname,
        pageCount: pageCount,
      });
    } catch (error) {
      console.error("=== PROCESSING ERROR ===");
      console.error(error);
      res.status(500).json({
        message: "Error processing file",
        error: error.message,
      });
    }
  },
);

// 2. Create New Order
router.post("/", async (req, res) => {
  try {
    const {
      name,
      usn,
      contact,
      files, // Array of { fileUrl, fileName, pageCount }
      copies,
      colorPages, // e.g., "1,3,5-7" or "all" or ""
      instructions,
      totalCost,
      transactionId,
    } = req.body;

    // Generate Unique Code using timestamp + random
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");

    // Use seconds + random for uniqueness
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const random = String(Math.floor(Math.random() * 100)).padStart(2, "0");

    let uniqueCode = `${day}${month}${seconds}${random}`;

    // If code exists, keep generating until unique
    let existing = await Order.findOne({ uniqueCode });
    let attempts = 0;
    while (existing && attempts < 10) {
      const newRandom = String(Math.floor(Math.random() * 10000)).padStart(
        4,
        "0",
      );
      uniqueCode = `${day}${month}${newRandom}`;
      existing = await Order.findOne({ uniqueCode });
      attempts++;
    }

    const newOrder = new Order({
      name,
      usn,
      contact,
      files,
      copies,
      colorPages,
      instructions,
      totalCost,
      transactionId,
      uniqueCode,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Order Creation Error:", error);
    res
      .status(500)
      .json({ message: "Error creating order", error: error.message });
  }
});

// 3. Get Order Status by ID (Public)
router.get("/status/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log("Status lookup for:", id);

    // 1. Try finding by uniqueCode
    order = await Order.findOne({ uniqueCode: id });

    // 2. If not found, and looks like ObjectId, try findById
    if (!order && mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
      console.log("Not found by code, trying ObjectId");
      order = await Order.findById(id);
    }

    console.log("Order found result:", order ? order._id : "null");

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({
      _id: order._id,
      uniqueCode: order.uniqueCode,
      status: order.status,
      studentName: order.name,
      fileName: order.files.map((f) => f.fileName).join(", "),
      totalCost: order.totalCost,
      createdAt: order.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Error checking status" });
  }
});

// 3.5. Search Orders by Student Name (Public)
router.get("/search/:name", async (req, res) => {
  try {
    const searchName = req.params.name.trim();
    if (!searchName) {
      return res.status(400).json({ message: "Search name is required" });
    }

    const orders = await Order.find({
      name: { $regex: searchName, $options: "i" },
    }).sort({ createdAt: -1 });

    res.json(
      orders.map((order) => ({
        _id: order._id,
        status: order.status,
        studentName: order.name,
        fileName: order.files.map((f) => f.fileName).join(", "),
        totalCost: order.totalCost,
        createdAt: order.createdAt,
      })),
    );
  } catch (error) {
    res.status(500).json({ message: "Error searching orders" });
  }
});

// 4. Get All Orders (Admin only)
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
});

// 5. Update Order Status (Admin only)
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
});

// 6. Delete Order (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order" });
  }
});

module.exports = router;
