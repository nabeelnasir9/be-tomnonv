const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  lineItems: { type: Array, required: true },
  // Additional order properties can be added here
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
