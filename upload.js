const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const { protect, adminOnly } = require("../middleware/auth");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), "uploads")),
  filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`)
});
const upload = multer({
  storage, limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype))
});
router.post("/", protect, adminOnly, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Upload a JPG, PNG, WEBP or GIF image (max 3 MB)" });
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});
module.exports = router;
