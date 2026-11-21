const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  mobile: { type: String, trim: true, sparse: true, unique: true },
  email: { type: String, trim: true, lowercase: true, sparse: true, unique: true },
  passwordHash: { type: String, select: false },
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  address: { type: String, default: "" },
  city: { type: String, default: "" },
  state: { type: String, default: "" },
  pin: { type: String, default: "" }
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  image: { type: String, default: "🐟" },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  description: { type: String, default: "" },
  image: { type: String, default: "🐠" },
  mrp: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 },
  pairMrp: { type: Number, default: 0, min: 0 },
  pairPrice: { type: Number, default: 0, min: 0 },
  singleEnabled: { type: Boolean, default: true },
  pairEnabled: { type: Boolean, default: false },
  stock: { type: Number, default: 0, min: 0 },
  available: { type: Boolean, default: true }
}, { timestamps: true });

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  option: { type: String, enum: ["single", "pair"], default: "single" },
  quantity: { type: Number, min: 1, default: 1 }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items: [cartItemSchema]
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customer: {
    name: String, mobile: String, address: String, city: String, state: String, pin: String
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: String, image: String, option: String,
    quantity: Number, unitPrice: Number, lineTotal: Number
  }],
  subtotal: { type: Number, required: true },
  deliveryCharge: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ["COD", "UPI_MANUAL"], default: "COD" },
  paymentStatus: { type: String, enum: ["pending", "submitted", "confirmed", "failed"], default: "pending" },
  utr: { type: String, default: "" },
  utr: { type: String, default: "" },
  status: { type: String, enum: ["Placed", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"], default: "Placed" }
}, { timestamps: true });

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  text: { type: String, default: "" },
  image: { type: String, default: "" },
  active: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  text: { type: String, default: "" },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const settingSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  value: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = {
  User: mongoose.model("User", userSchema),
  Category: mongoose.model("Category", categorySchema),
  Product: mongoose.model("Product", productSchema),
  Cart: mongoose.model("Cart", cartSchema),
  Order: mongoose.model("Order", orderSchema),
  Banner: mongoose.model("Banner", bannerSchema),
  Offer: mongoose.model("Offer", offerSchema),
  Setting: mongoose.model("Setting", settingSchema)
};
