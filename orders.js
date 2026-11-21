const router = require("express").Router();
const mongoose = require("mongoose");
const { Order, Product, Cart, User } = require("../models");
const { protect, adminOnly } = require("../middleware/auth");
router.use(protect);

router.post("/", async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    let created;
    await session.withTransaction(async () => {
      const { items, paymentMethod = "COD", customer, utr = "" } = req.body;
      if (!customer?.name || !customer?.mobile || !customer?.address || !customer?.city || !customer?.state || !customer?.pin)
        throw Object.assign(new Error("Complete delivery details are required"), { status: 400 });
      if (!Array.isArray(items) || !items.length) throw Object.assign(new Error("Order must contain items"), { status: 400 });
      if (!["COD", "UPI_MANUAL"].includes(paymentMethod)) throw Object.assign(new Error("Invalid payment method"), { status: 400 });
      const lines = []; let subtotal = 0;
      for (const item of items) {
        const p = await Product.findById(item.product).session(session);
        if (!p || !p.available) throw Object.assign(new Error("A product is unavailable"), { status: 400 });
        const qty = Number(item.quantity);
        if (!Number.isInteger(qty) || qty < 1 || qty > 20) throw Object.assign(new Error("Invalid quantity"), { status: 400 });
        const pair = item.option === "pair";
        if (pair && !p.pairEnabled) throw Object.assign(new Error("Pair option unavailable"), { status: 400 });
        if (p.stock < qty) throw Object.assign(new Error(`Insufficient stock for ${p.name}`), { status: 409 });
        p.stock -= qty; await p.save({ session });
        const unitPrice = pair ? p.pairPrice : p.price;
        const lineTotal = unitPrice * qty; subtotal += lineTotal;
        lines.push({ product: p._id, name: p.name, image: p.image, option: pair ? "pair" : "single", quantity: qty, unitPrice, lineTotal });
      }
      const [order] = await Order.create([{ user: req.user._id, customer, items: lines, subtotal, total: subtotal, paymentMethod, paymentStatus: paymentMethod === "COD" ? "pending" : "submitted", utr: String(utr).trim().slice(0, 30), orderNumber: `AW${Date.now().toString().slice(-8)}` }], { session });
      created = order;
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] }, { session });
      await User.findByIdAndUpdate(req.user._id, { name: customer.name, mobile: customer.mobile, address: customer.address, city: customer.city, state: customer.state, pin: customer.pin }, { session });
    });
    res.status(201).json(created);
  } catch (e) { next(e); } finally { await session.endSession(); }
});
router.get("/mine", async (req, res) => res.json(await Order.find({ user: req.user._id }).sort("-createdAt")));
router.get("/:id", async (req, res) => {
  const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, user: req.user._id };
  const o = await Order.findOne(filter); if (!o) return res.status(404).json({ message: "Order not found" }); res.json(o);
});
router.patch("/:id/cancel", async (req, res) => {
  const o = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!o) return res.status(404).json({ message: "Order not found" });
  if (!["Placed", "Confirmed"].includes(o.status)) return res.status(409).json({ message: "This order can no longer be cancelled online" });
  o.status = "Cancelled"; await o.save(); res.json(o);
});

// Admin order management
router.get("/admin/all", adminOnly, async (req, res) => res.json(await Order.find().populate("user", "name mobile email").sort("-createdAt")));
router.patch("/admin/:id/status", adminOnly, async (req, res) => {
  const allowed = ["Placed", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid order status" });
  const o = await Order.findById(req.params.id); if (!o) return res.status(404).json({ message: "Order not found" });
  o.status = req.body.status; await o.save(); res.json(o);
});
router.patch("/admin/:id/payment", adminOnly, async (req, res) => {
  if (!["pending", "submitted", "confirmed", "failed"].includes(req.body.paymentStatus)) return res.status(400).json({ message: "Invalid payment status" });
  const o = await Order.findById(req.params.id); if (!o) return res.status(404).json({ message: "Order not found" });
  o.paymentStatus = req.body.paymentStatus; await o.save(); res.json(o);
});
module.exports = router;
