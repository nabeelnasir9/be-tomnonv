const express = require("express");
const User = require("../models/user");
const Stripe = require("stripe");
const Order = require("../models/order");
require("dotenv").config();

const stripe = Stripe(process.env.STRIPE_KEY);
const router = express.Router();
// router.get("/sessionid", async (req, res) => {
//   try {
//     const session = await stripe.checkout.sessions.retrieve(
//       "cs_test_a1DJJbZ86EqMcRWAhWDImE1eFJHExzbgnZpDCbY6IOgF2yPzVzp7vMaraj",
//     );
//     res.json(session);
//   } catch (error) {
//     console.log(error);
//   }
// });
router.get("/all-users", async (req, res) => {
  try {
    const users = await User.find().populate("orders");
    for (const user of users) {
      for (const order of user.orders) {
        try {
          const session = await stripe.checkout.sessions.retrieve(
            order.sessionId,
          );
          order.shipping = session;
          await order.save();
        } catch (error) {
          console.error("Error retrieving session:", error.message);
        }
      }
    }
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

router.get("/all-orders", async (req, res) => {
  try {
    const orders = await Order.find();
    let totalAmount = 0;
    let totalItemCount = 0;
    let paidCount = 0;
    let unpaidCount = 0;

    orders.forEach((order) => {
      totalAmount += order.shipping.amount_total;

      order.lineItems.forEach((item) => {
        totalItemCount += parseInt(item.quantity);
      });

      const paymentStatus = order.shipping.payment_status;
      if (paymentStatus === "paid") {
        paidCount++;
      } else if (paymentStatus === "unpaid") {
        unpaidCount++;
      }
    });
    const response = {
      totalAmount,
      totalItemCount,
      paymentStatusCounts: {
        paid: paidCount,
        unpaid: unpaidCount,
      },
    };
    res.json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
