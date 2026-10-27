# 🌿 Zaytoun Atelier — Haute Couture & Ready-to-Wear Storefront

[![React](https://img.shields.io/badge/React-19.1-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-5.3-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Node.js](https://img.shields.io/badge/Node.js-ESM-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)

An immersive, high-fashion e-commerce web application inspired by the earthy luxury of Mediterranean landscapes. Built around a signature palette of **Deep Olive** (`#364634`), **Desert Camel** (`#C69F6F`), **Alabaster White**, and **Onyx Black**, **Zaytoun Atelier** bridges physical tailoring with cutting-edge digital experiences—featuring 3D interactive mannequin turntables and a 2D mix-and-match virtual fitting room engine.

---

## ✨ Features & Highlights

### 🧵 1. Immersive 3D & 2D Fitting Experience
* **3D Mannequin Turntable**: Interactive 3D garment visualization powered by `@google/model-viewer` and WebGL, allowing 360° orbital rotation, tilt control, and garment inspection.
* **FORME Layering Engine**: Deterministic SVG-based try-on system supporting **Women**, **Men**, and **Kids** mannequins with intelligent garment layering (tops + bottoms combine, dresses replace outfits, outerwear layers on top).
* **Demographic Switching & Color Fidelity**: Real-time palette switching with authentic fabric representations (silk, cashmere, linen, leather).

### 🛍️ 2. Luxury E-Commerce Flow
* **Multi-Currency Engine**: Live switcher supporting **PKR (Rs)**, **USD ($)**, **EUR (€)**, and **GBP (£)** with auto-conversion.
* **Seamless Checkout & Tracking**: Interactive cart drawer, checkout modal with validation, automated order confirmations, and real-time **Order Tracking** via order ID.
* **Editorial Showcase**: Curated campaigns, marquee strips, fabric texture modal, and dynamic size guide.

### 🎨 3. Atelier Studio & Customization
* **In-Browser Catalog Management**: Add, update, and manage products with custom transparent cutout alignments and positioning tools.
* **Brand Appearance Controls**: Edit store branding and accent colors directly with live preview and catalog export/import (`products.json`).
* **Dark & Light Mode**: Fluid day/night switching persisted in local storage.

### 🛡️ 4. Full-Stack Architecture
* **RESTful Backend**: Node.js & Express 5 API handling products, orders, customer inquiries, newsletter subscribers, and admin authentication.
* **Database & Mail Services**: MongoDB (Mongoose) with transactional schemas, plus email dispatch powered by **Resend** and **Nodemailer (Gmail SMTP)**.
* **Automated E2E Suite**: Comprehensive test suite verifying tier-1 features, layering rules, color fidelity, and fitting room interactions.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 7, Tailwind CSS 3, React Router v7 |
| **3D & Graphics** | `@google/model-viewer`, Three.js-compatible GLB models, SVG engine |
| **Backend** | Node.js (ESM), Express 5, Mongoose 9 (MongoDB) |
| **Auth & Security** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `joi` input validation |
| **Email Services** | `resend`, `nodemailer` (SMTP fallback) |
| **Testing** | Node test runner, custom E2E assertion helpers |

---

## 📁 Project Structure

```text
zaytoun-atelier-website/
├── public/
│   ├── images/              # High-resolution editorial campaign photos
│   ├── models/              # 3D GLB assets (mannequins, coats, dresses)
│   └── videos/              # Hero background fashion videos
├── server/
│   ├── index.js             # Express API entry point & routes
│   ├── db.js                # MongoDB connection handler
│   ├── models/              # Mongoose models (Order, Product, Customer, etc.)
│   ├── middleware/          # JWT authentication & Joi request validation
│   └── services/            # Email notifications (Resend / Nodemailer)
├── src/
│   ├── components/          # Reusable UI (Navbar, Cart, 3D Mannequin, Modals)
│   ├── context/             # Currency and global state providers
│   ├── data/                # Static catalog and brand color palette definitions
│   ├── engine/              # FORME 2D layering and cutout calculation engine
│   ├── pages/               # HomePage, ShopPage, StudioPage, OrderTracking, etc.
│   ├── App.jsx              # Application router and root state
│   └── index.css            # Tailwind directives and custom animation styles
├── tests/                   # E2E test suites for tier-1 features
├── .env.example             # Template for environment variables
├── package.json             # Dependencies and scripts
└── vite.config.js           # Vite development and build configuration
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **MongoDB**: A local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URI

### Installation

1. **Clone the repository:**
   ```bash
   git clone git@github.com:ShahrozMubarak/zaytoun-atelier-website.git
   cd zaytoun-atelier-website
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your credentials:
   ```env
   # Database
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/zaytoun_atelier
   PORT=5000

   # Security
   ADMIN_PASSWORD=your_secure_password
   JWT_SECRET=your_jwt_secret_key
   VITE_ADMIN_PASSCODE=your_secure_password

   # Email Service (Optional for checkout confirmation emails)
   RESEND_API_KEY=re_your_key_here
   # Or configure Gmail SMTP variables in .env
   ```

---

## 🏃 Running the Application

### Option A: Run Full Stack (Frontend + Backend concurrently)
```bash
npm run dev:all
```

### Option B: Run Individually
* **Frontend Dev Server:**
  ```bash
  npm run dev
  ```
  App will be accessible at: `http://localhost:5173`

* **Backend Express Server:**
  ```bash
  npm run server
  ```
  API will run at: `http://localhost:5000`

### Build for Production
```bash
npm run build
npm run preview
```

---

## 🧪 Running Tests

To run the automated E2E test suite for tier-1 fitting room and catalog interactions:
```bash
node --test tests/e2e/tier1_features/*.test.js
```

---

## 👤 Author

* **Shahroz Mubarak**
* Email: [shaahrozdogar@gmail.com](mailto:shaahrozdogar@gmail.com)
* GitHub: [@ShahrozMubarak](https://github.com/ShahrozMubarak)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
