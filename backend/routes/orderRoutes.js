const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { upload } = require("../config/cloudinary");
const pdfParse = require("pdf-parse");
const axios = require("axios");
const auth = require("../middleware/auth.js");

// Route to handle File Upload & Page Counting
router.post(
  "/upload",
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        console.error("=== MULTER/CLOUDINARY ERROR ===");
        console.error("Error:", err);
        console.error("===============================");
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

      console.log("Full req.file:", JSON.stringify(req.file, null, 2));

      const fileUrl = req.file.path;
      console.log(`Fetching PDF from: ${fileUrl}`);

      const response = await axios.get(fileUrl, {
        responseType: "arraybuffer",
      });
      const buffer = Buffer.from(response.data);

      console.log(`Buffer size: ${buffer.length} bytes`);

      if (buffer.length === 0) {
        throw new Error("Downloaded PDF is empty");
      }

      // Check if it's a valid PDF (starts with %PDF)
      const pdfHeader = buffer.toString("utf8", 0, 4);
      console.log(`PDF header: ${pdfHeader}`);

      if (!pdfHeader.startsWith("%PDF")) {
        console.log(
          "First 100 bytes:",
          buffer.toString("utf8", 0, Math.min(100, buffer.length)),
        );
        throw new Error("Downloaded file is not a valid PDF");
      }

      console.log("Parsing PDF...");
      const data = await pdfParse(buffer);
      const pageCount = data.numpages;
      console.log(`Page count: ${pageCount}`);

      res.json({
        fileUrl: fileUrl,
        fileName: req.file.originalname,
        pageCount: pageCount,
      });
    } catch (error) {
      console.error("=== UPLOAD ERROR ===");
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      console.error("===================");
      res.status(500).json({
        message: "Error processing file",
        error: error.message,
        details: error.response?.data || "No additional details",
      });
    }
  },
);

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

router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

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

module.exports = router;
