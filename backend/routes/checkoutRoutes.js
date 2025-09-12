const express = require("express");
const Stripe = require("stripe");
const { protect } = require("../middleware/authMiddleware");
const Checkout = require("../models/Checkout");
const Order = require("../models/Order");
const Cart = require("../models/Cart");

const router = express.Router();

// Make sure STRIPE_SECRET_KEY is loaded
console.log("Stripe Secret Key:", process.env.STRIPE_SECRET_KEY);

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ==============================
// Create Checkout session
// ==============================
router.post("/", protect, async (req, res) => {
  const { checkoutItems, shippingAddress, paymentMethod, totalPrice } = req.body;

  if (!checkoutItems || checkoutItems.length === 0) {
    return res.status(400).json({ message: "No items in checkout" });
  }

  try {
    const newCheckout = await Checkout.create({
      user: req.user._id,
      checkoutItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      paymentStatus: "Pending",
      isPaid: false,
    });

    res.status(201).json(newCheckout);
  } catch (error) {
    console.error("Error creating checkout session", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ==============================
// Create Stripe PaymentIntent
// ==============================
router.post("/:id/create-payment-intent", protect, async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) return res.status(404).json({ message: "Checkout not found" });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(checkout.totalPrice * 100), // convert dollars → cents
      currency: "usd",
      metadata: {
        checkoutId: checkout._id.toString(),
        userId: req.user._id.toString(),
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ message: "Stripe error", error: error.message });
  }
});

// ==============================
// Confirm Payment & Mark Checkout Paid
// ==============================
router.put("/:id/pay", protect, async (req, res) => {
  const { paymentIntentId } = req.body;

  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) return res.status(404).json({ message: "Checkout not found" });

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      checkout.isPaid = true;
      checkout.paymentGateway = "stripe";
      checkout.paymentStatus = "paid";
      checkout.paymentDetails = paymentIntent;
      checkout.paidAt = Date.now();
      await checkout.save();

      res.status(200).json({ checkout });
    } else {
      res.status(400).json({ message: "Payment not successful" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ==============================
// Finalize Checkout -> Create Order
// ==============================
router.post("/:id/finalize", protect, async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) return res.status(404).json({ message: "Checkout not found" });

    if (checkout.isPaid && !checkout.isFinalized) {
      const finalOrder = await Order.create({
        user: checkout.user,
        orderItems: checkout.checkoutItems,
        shippingAddress: checkout.shippingAddress,
        paymentMethod: checkout.paymentMethod,
        totalPrice: checkout.totalPrice,
        isPaid: true,
        paidAt: checkout.paidAt,
        isDelivered: false,
        paymentStatus: "paid",
        paymentDetails: checkout.paymentDetails,
      });

      checkout.isFinalized = true;
      checkout.finalizedAt = Date.now();
      await checkout.save();

      await Cart.findOneAndDelete({ user: checkout.user });

      res.status(201).json(finalOrder);
    } else if (checkout.isFinalized) {
      res.status(400).json({ message: "Checkout already finalized" });
    } else {
      res.status(400).json({ message: "Checkout is not paid" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
