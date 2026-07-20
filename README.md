# 🌿 NatureCart

**NatureCart** is a premium, professional full-stack e-commerce marketplace connecting consumers directly with verified local farmers. It streamlines farm-to-table trade through offline cash-on-delivery payments, local pickups, and robust management dashboards for farmers, buyers, and administrators.

---

## ✨ Key Highlights

### 👤 Role-Based Portals & Key Features

*   **Consumer Experience:**
    *   **Premium Product Catalog:** Search and filter farm-fresh produce with dynamic organic category tags and smooth hover-zoom effects.
    *   **Redesigned Shopping Cart:** Easily manage item quantities (`+`/`-` updates), view thumbnail images, and track dynamic checkout summaries.
    *   **Interactive Redirection Overlay:** When adding items, consumers see a 5-second countdown prompt to quickly navigate to the cart or continue browsing.
    *   **Time & Hours Coordinator:** Native HTML5 clock selector restricts checkout pickup coordinates to operational business hours (8 AM - 7 PM).
    *   **Live Order Confirmations:** Instant toast notifications alert logged-in consumers immediately when a farmer confirms their pending order.

*   **Farmer Workspace:**
    *   **Listing Management:** Add, edit, or remove organic products with real-time stock and pricing variables.
    *   **Instant Order Alerts:** Background order checks prompt farmers upon login or page refresh if they have pending orders awaiting verification.
    *   **Earnings Dashboard:** Visually track and review completed transactions and revenue stats.

*   **Administrator Console:**
    *   **Seller Verification:** Exclude public farmer registrations to maintain marketplace integrity; farmers are vetted and added directly by the admin.
    *   **Interactive Data Visualizations:** Premium area and bar charts tracking daily sales volume, active users, and category splits.
    *   **Dual Format Reports:** Export full operational reports in both **CSV** and **PDF** formats. The PDF includes branded NatureCart headers/footers, date filters, and structured tabular stats.

---

## 🎨 Design & Aesthetic System
*   **Vibrant Organic Theme:** Balanced layout built using modern slate, fresh emerald teal, and warm harvest orange highlight tokens.
*   **Modern Typography:** Styled with *Plus Jakarta Sans* and *Fraunces Serif* to evoke a premium organic brand feel.
*   **Glassmorphic Accents:** Features smooth background gradients, blurred navbar structures, and elevated drop shadows for visual polish.

---

## 🛠️ Technology Stack

*   **Frontend:** React (Vite), Tailwind CSS, Recharts (visual charts), jsPDF & jspdf-autotable (PDF reports), React Icons.
*   **Backend:** Node.js, Express, Mongoose (MongoDB ORM), bcryptjs (auth hashing), jsonwebtoken (secure route tokens).

---

## ⚙️ Quick Start Guide

### 1. Prerequisites
Make sure you have Node.js and MongoDB installed on your system.

### 2. Environment Configuration
Create a `.env` file inside the `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/naturecart
JWT_SECRET=your_jwt_secret_key
```

### 3. Running Locally

#### Start the Backend Server:
```bash
cd server
npm install
npm start
```

#### Start the Frontend Client:
```bash
cd client
npm install
npm run dev
```
Navigate to `http://localhost:5173` to explore the marketplace.
