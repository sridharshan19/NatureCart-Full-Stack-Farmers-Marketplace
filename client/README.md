🌿 NatureCart – Full Stack Farmers Marketplace

NatureCart is a full-stack marketplace platform that connects farmers directly with consumers, eliminating middlemen and enabling transparent, efficient trade.

It supports role-based workflows for Admin, Farmer, and Consumer, with complete end-to-end functionality including authentication, product management, cart, checkout, and order tracking.

🚀 Features
🔐 Authentication & Authorization

Register as Consumer or Farmer

Login for Admin / Farmer / Consumer

JWT-based authentication

Forgot & Reset Password

First Admin Setup

Role-based route protection (Middleware)

👥 Role-Based System
🛠 Admin

Create and manage farmers

Add/delete products (for any farmer)

View all farmers and their products

Review all orders

Update order status

Access analytics dashboard

🌾 Farmer

Manage own products

View managed products

Review assigned orders

Update order status (Confirmed / Completed)

View earnings & sales insights

🛒 Consumer

Register/Login

Browse products

Add to cart

Manage cart

Checkout & place orders

Track orders

Reset password

Submit reviews (after order completion)

🛍 Product Management

Public product listing

Farmer creates products

Admin can create products for any farmer

Delete products (Admin/Farmer)

Image upload support (not just URLs)

🛒 Cart System

Consumer-only cart

Add items

Update quantity

Remove items

Clear cart

Persistent cart experience

📦 Order Management

Place orders from cart

Multi-farmer order handling

Farmers manage only their items

Admin oversees all orders

Order status:

Pending → Confirmed → Completed

⏰ Pickup Scheduling

Available pickup time slots API

Local pickup system instead of delivery

⭐ Review System

Consumers can review only after order completion

Ensures authentic feedback

Farmers can view reviews

📊 Admin Analytics

Sales trends

Top products

Top farmers

Revenue insights

CSV export support

Filters (date / farmer)

🔔 UX Enhancements

Toast notifications

Role-based dashboards

Responsive UI

Clean color theme (teal / amber / slate)

🏗 Tech Stack
Frontend

React (Vite)

Axios

React Router

Bootstrap / Custom UI

Backend

Node.js

Express.js

🔗 API Endpoints

Module	Endpoint
Auth	/api/auth
Products	/api/products
Cart	/api/cart
Orders	/api/orders
Farmer	/api/farmer
Pickup Slots	/api/pickup
🧾 Logging System

Startup logs

Request logs

Auth logs

Product/Cart/Order logs

Structured error logging

⚙️ Setup Instructions

1️⃣ Clone the Repository

git clone https://github.com/your-username/NatureCart.git

cd NatureCart

2️⃣ Backend Setup

cd server

npm install

Create .env file:

PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key

Run backend:

npm run dev

3️⃣ Frontend Setup

cd client

npm install

npm run dev


🌟 Current Status

✅ Fully functional:

Authentication system

Role-based access

Product management

Cart & checkout

Order lifecycle

Admin dashboard

🔮 Future Improvements

Route guards on frontend navigation

Environment-based API URLs

Dedicated forgot/reset UI pages

Edit forms for products/farmers

Automated testing (Jest / Cypress)

Payment integration (Stripe/Razorpay)

Real-time notifications

MongoDB + Mongoose

JWT Authentication
