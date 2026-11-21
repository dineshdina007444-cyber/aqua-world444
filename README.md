# Aqua World — Full Stack Web Development

**Stack:** HTML/CSS/JavaScript frontend, Node.js, Express.js, MongoDB and Mongoose.

Your supplied Aqua World storefront is included and connected to the REST API. Catalog, categories, banners, offers, shop settings, authentication, customer cart, orders, stock updates and admin management use MongoDB-backed APIs. Customer sign-in uses a password; **there is no OTP flow**.

## Requirements

- Node.js 20 or newer
- MongoDB Community Server or MongoDB Atlas
- npm

## Setup

1. Extract the ZIP and open a terminal in the `aqua-world-full-stack` folder.
2. Install packages:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env`. Set `MONGODB_URI`, a unique `JWT_SECRET` of at least 32 characters, and your admin email/password. The admin password must be at least 12 characters.
4. Start MongoDB. For order placement, use MongoDB Atlas or a local MongoDB replica set because the order endpoint uses transactions.
5. Create the admin account:

   ```bash
   npm run seed:admin
   ```

6. (Optional) Insert sample fish, accessories, banners and offers:

   ```bash
   npm run seed:shop
   ```

7. Start the website:

   ```bash
   npm run dev
   ```

8. Open `http://localhost:5000`. Customers can create an account using their name, 10-digit Indian mobile number and password. The admin signs in from the “Admin Login” link using the admin email/password configured in `.env`.

API health check: `http://localhost:5000/api/health`.

## Main API routes

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Customer registration |
| POST | `/api/auth/login` | Password login (mobile or email) |
| GET | `/api/auth/me` | Current signed-in account |
| GET | `/api/categories` | Active categories |
| GET | `/api/products` | Product catalog; supports `?category=` and `?search=` |
| GET | `/api/banners`, `/api/offers`, `/api/settings` | Store content and settings |
| GET/PUT/DELETE | `/api/cart` | Signed-in customer's cart |
| POST | `/api/orders` | Place order; server validates stock and prices |
| GET | `/api/orders/mine` | Customer order history |
| GET | `/api/orders/admin/all` | Admin order list |
| PATCH | `/api/orders/admin/:id/status` | Admin order status update |
| PATCH | `/api/orders/admin/:id/payment` | Admin payment status update |
| POST | `/api/uploads` | Admin image upload (multipart field `image`) |

Admin-only catalog routes support POST/PATCH/DELETE for `/api/categories`, `/api/products`, `/api/banners`, and `/api/offers`. Shop settings are saved with `PUT /api/settings/:key`. Protected requests use `Authorization: Bearer <token>`.

## Payment and deployment notes

- Cash on Delivery is supported.
- PhonePe, Google Pay and Paytm QR are handled as **manual UPI submissions**. The customer enters a UTR/reference; the shop must verify the payment in its merchant account and mark it confirmed in the admin area. This is not an automatic payment gateway.
- No OTP, SMS gateway or automatic UPI verification is included.
- Use HTTPS, a strong JWT secret, secure backups, and a managed image store for production. Configure `CLIENT_ORIGIN` if hosting the frontend on a separate domain.
- Test registration, admin access, stock, order placement, cancellation and manual payment confirmation on your own MongoDB deployment before accepting real customer orders.

## Project structure

```text
aqua-world-full-stack/
├── public/index.html
├── src/config/
├── src/middleware/
├── src/models/
├── src/routes/
├── src/utils/createAdmin.js
├── src/utils/seedShop.js
├── uploads/
├── .env.example
├── package.json
└── README.md
```
