const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  contact: { type: String, required: false },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  pageCount: { type: Number, required: true },
  copies: { type: Number, required: true, default: 1 },
  color: { type: Boolean, required: true, default: false }, // true = Color, false = B&W
  instructions: { type: String, default: "" },
  totalCost: { type: Number, required: true },
  transactionId: { type: String, required: true },
  uniqueCode: { type: String, unique: true },
  status: {
    type: String,
    enum: ["Pending", "Printed", "Collected"],
    default: "Pending",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
