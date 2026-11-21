const router = require("express").Router();
const { Cart, Product } = require("../models");
const { protect } = require("../middleware/auth");
router.use(protect);
router.get("/", async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  res.json(cart || { user: req.user._id, items: [] });
});
router.put("/", async (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  for (const item of items) {
    if (!["single", "pair"].includes(item.option) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 50)
      return res.status(400).json({ message: "Invalid cart item" });
    const product = await Product.findById(item.product);
    if (!product || !product.available) return res.status(400).json({ message: "A product is unavailable" });
    if (item.option === "pair" && !product.pairEnabled) return res.status(400).json({ message: "Pair option is unavailable" });
  }
  const cart = await Cart.findOneAndUpdate({ user: req.user._id }, { items }, { upsert: true, new: true, runValidators: true }).populate("items.product");
  res.json(cart);
});
router.delete("/", async (req, res) => { await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] }, { upsert: true }); res.json({ message: "Cart cleared" }); });
module.exports = router;
