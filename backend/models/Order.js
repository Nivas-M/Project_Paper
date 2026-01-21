const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  usn: { type: String, required: true },
  contact: { type: String, required: false },
  files: [
    {
      fileUrl: { type: String, required: true },
      fileName: { type: String, required: true },
      pageCount: { type: Number, required: true },
    },
  ],
  copies: { type: Number, required: true, default: 1 },
  colorPages: { type: String, default: "" }, // e.g., "1,3,5-7" or "all" or empty for all B&W
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
