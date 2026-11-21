const router = require("express").Router();
const { Category, Product, Banner, Offer, Setting } = require("../models");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/categories", async (req, res) => res.json(await Category.find({ active: true }).sort("name")));
router.get("/products", async (req, res) => {
  const filter = { available: true };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) filter.name = { $regex: req.query.search, $options: "i" };
  res.json(await Product.find(filter).populate("category", "name").sort("-createdAt"));
});
router.get("/products/:id", async (req, res) => {
  const p = await Product.findById(req.params.id).populate("category", "name");
  if (!p || !p.available) return res.status(404).json({ message: "Product not found" });
  res.json(p);
});
router.get("/banners", async (req, res) => res.json(await Banner.find({ active: true }).sort("sortOrder")));
router.get("/offers", async (req, res) => res.json(await Offer.find({ active: true }).sort("-createdAt")));
router.get("/settings", async (req, res) => {
  const rows = await Setting.find();
  res.json(Object.fromEntries(rows.map(x => [x.key, x.value])));
});

// Admin catalog management
router.post("/categories", protect, adminOnly, async (req, res) => res.status(201).json(await Category.create(req.body)));
router.patch("/categories/:id", protect, adminOnly, async (req, res) => {
  const x = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!x) return res.status(404).json({ message: "Category not found" }); res.json(x);
});
router.delete("/categories/:id", protect, adminOnly, async (req, res) => {
  if (await Product.exists({ category: req.params.id })) return res.status(409).json({ message: "Move or delete this category's products first" });
  await Category.findByIdAndDelete(req.params.id); res.json({ message: "Category deleted" });
});
router.post("/products", protect, adminOnly, async (req, res) => res.status(201).json(await Product.create(req.body)));
router.patch("/products/:id", protect, adminOnly, async (req, res) => {
  const x = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!x) return res.status(404).json({ message: "Product not found" }); res.json(x);
});
router.delete("/products/:id", protect, adminOnly, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id); res.json({ message: "Product deleted" });
});
router.post("/banners", protect, adminOnly, async (req, res) => res.status(201).json(await Banner.create(req.body)));
router.patch("/banners/:id", protect, adminOnly, async (req, res) => res.json(await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })));
router.delete("/banners/:id", protect, adminOnly, async (req, res) => { await Banner.findByIdAndDelete(req.params.id); res.json({ message: "Banner deleted" }); });
router.post("/offers", protect, adminOnly, async (req, res) => res.status(201).json(await Offer.create(req.body)));
router.patch("/offers/:id", protect, adminOnly, async (req, res) => res.json(await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })));
router.delete("/offers/:id", protect, adminOnly, async (req, res) => { await Offer.findByIdAndDelete(req.params.id); res.json({ message: "Offer deleted" }); });
router.put("/settings/:key", protect, adminOnly, async (req, res) => {
  const x = await Setting.findOneAndUpdate({ key: req.params.key }, { value: req.body.value }, { upsert: true, new: true, runValidators: true });
  res.json(x);
});
module.exports = router;
