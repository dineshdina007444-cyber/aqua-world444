const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { protect } = require("../middleware/auth");

function issue(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
}
router.post("/register", async (req, res, next) => {
  try {
    const { name, mobile, email, password } = req.body;
    if (!name || (!mobile && !email) || !password || password.length < 8)
      return res.status(400).json({ message: "Name, mobile or email, and password (8+ characters) are required" });
    const user = await User.create({ name, mobile, email, passwordHash: await bcrypt.hash(password, 12), role: "customer" });
    res.status(201).json({ token: issue(user), user: { id: user._id, name: user.name, mobile: user.mobile, email: user.email, role: user.role } });
  } catch (e) { next(e); }
});
router.post("/login", async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ message: "Identifier and password are required" });
    const user = await User.findOne({ $or: [{ mobile: identifier }, { email: String(identifier).toLowerCase() }] }).select("+passwordHash");
    if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ message: "Invalid login details" });
    res.json({ token: issue(user), user: { id: user._id, name: user.name, mobile: user.mobile, email: user.email, role: user.role } });
  } catch (e) { next(e); }
});
router.get("/me", protect, (req, res) => res.json({ user: { id: req.user._id, name: req.user.name, mobile: req.user.mobile, email: req.user.email, role: req.user.role } }));
module.exports = router;
