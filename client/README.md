# 🌿 NatureCart – Farmers Marketplace Platform

NatureCart is a **full-stack marketplace platform** that connects farmers directly with consumers, eliminating middlemen and enabling **transparent, efficient trade**.

It supports **role-based workflows** for Admin, Farmer, and Consumer, with complete end-to-end functionality including authentication, product management, cart, checkout, and order tracking.

---

## 🚀 Features

### 🔐 Authentication & Authorization

* Register as **Consumer or Farmer**
* Login for **Admin / Farmer / Consumer**
* JWT-based authentication
* Forgot & Reset Password
* First Admin Setup
* Role-based route protection (Middleware)

---

## 👥 Role-Based System

### 🛠 Admin

* Manage farmers
* Add/Delete products (for any farmer)
* View all farmers & products
* Monitor all orders
* Update order status
* Access analytics dashboard

### 🌾 Farmer

* Manage own products
* View assigned orders
* Update order status (Confirmed / Completed)
* View earnings & sales insights

### 🛒 Consumer

* Browse products
* Manage cart
* Checkout & place orders
* Track orders
* Submit reviews (after completion)

---

## 🛍 Product Management

* Public product listing
* Farmers can create products
* Admin can create products for any farmer
* Image upload support
* Delete products (Admin/Farmer)

---

## 🛒 Cart System

* Consumer-only cart
* Add / Update / Remove items
* Clear cart
* Persistent cart experience

---

## 📦 Order Management

* Place orders from cart
* Multi-farmer order handling
* Farmers manage only their items
* Admin oversees all orders

### Order Status Flow:

`Pending → Confirmed → Completed`

---

## ⏰ Pickup Scheduling

* Pickup time slots API
* Local pickup system (no delivery)

---

## ⭐ Review System

* Reviews allowed only after order completion
* Ensures authentic feedback
* Farmers can view reviews

---

## 📊 Admin Analytics

* Sales trends
* Top products & farmers
* Revenue insights
* CSV export support
* Filters (date / farmer)

---

## 🔔 UX Enhancements

* Toast notifications
* Role-based dashboards
* Responsive UI
* Clean theme (teal / amber / slate)

---

## 🏗 Tech Stack

### Frontend

* React (Vite)
* Axios
* React Router
* Bootstrap / Custom UI

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT Authentication

---

## 🔗 API Endpoints

| Module       | Endpoint      |
| ------------ | ------------- |
| Auth         | /api/auth     |
| Products     | /api/products |
| Cart         | /api/cart     |
| Orders       | /api/orders   |
| Farmer       | /api/farmer   |
| Pickup Slots | /api/pickup   |

---

## 🧾 Logging System

* Startup logs
* Request logs
* Authentication logs
* Product / Cart / Order logs
* Structured error logging

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/NatureCart.git
cd NatureCart
```

### 2️⃣ Backend Setup

```bash
cd server
npm install
```

Create `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

Run backend:

```bash
npm run dev
```

---

### 3️⃣ Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## 🌟 Current Status

✅ Fully Functional:

* Authentication system
* Role-based access
* Product management
* Cart & checkout
* Order lifecycle
* Admin dashboard

---

## 🔮 Future Improvements

* Frontend route guards
* Environment-based API URLs
* Edit forms for products/farmers
* Automated testing (Jest / Cypress)
* Payment integration (Stripe / Razorpay)
* Real-time notifications (WebSockets)

---

## 📸 Screenshots (Add these!)

> Add UI screenshots here for better impact

---

## 🚀 Deployment (Recommended)

* Frontend: Vercel
* Backend: Render 
* Database: MongoDB Atlas

---

## 💡 Why This Project Matters

NatureCart solves a real-world problem by:

* Empowering farmers with direct market access
* Reducing dependency on intermediaries
* Providing transparency in pricing and trade

---

## 👨‍💻 Author

Your Name
GitHub: https://github.com/your-username
