const express = require("express");
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
  }
);

// 2. Create New Order
router.post("/", async (req, res) => {
  try {
    const {
      studentName,
      contact,
      fileUrl,
      fileName,
      pageCount,
      copies,
      color,
      instructions,
      totalCost,
      transactionId,
    } = req.body;

    const newOrder = new Order({
      studentName,
      contact,
      fileUrl,
      fileName,
      pageCount,
      copies,
      color,
      instructions,
      totalCost,
      transactionId,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({ message: "Error creating order" });
  }
});

// 3. Get Order Status by ID (Public)
router.get("/status/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({
      _id: order._id,
      status: order.status,
      studentName: order.studentName,
      fileName: order.fileName,
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
      studentName: { $regex: searchName, $options: 'i' }
    }).sort({ createdAt: -1 });
    
    res.json(orders.map(order => ({
      _id: order._id,
      status: order.status,
      studentName: order.studentName,
      fileName: order.fileName,
      totalCost: order.totalCost,
      createdAt: order.createdAt,
    })));
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
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// 5. Update Order Status (Admin only)
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
});

module.exports = router;