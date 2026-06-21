# 🥛 Vaishnavi Milk Dairy — Dairy Delivery Web Application

A full-stack, production-ready dairy delivery platform: browse products, subscribe to daily/weekly/monthly
delivery, place orders with Google Maps-linked addresses, and track them — plus a complete admin dashboard.

**Stack:** React (Vite) + Tailwind CSS + React Router + Axios · Node.js + Express + MongoDB/Mongoose ·
JWT auth with Username/Email + Password (Email OTP verification on signup) + Google OAuth · Deploys to Vercel (frontend) + Render (backend) + MongoDB Atlas (DB).

---

## 1. Project structure

```
dairy-delivery/
├── backend/                 # Express API
│   ├── config/db.js         # MongoDB connection
│   ├── models/               # User, Product, Order, Otp
│   ├── controllers/          # Route logic
│   ├── routes/                # Express routers
│   ├── middleware/            # JWT auth, admin guard, error handler
│   ├── utils/                  # JWT signing, OTP generation/sending, Maps link builder
│   ├── seed/seed.js           # Creates an admin user + sample products
│   ├── server.js               # App entry point
│   └── .env.example
└── frontend/                 # React (Vite) app
    ├── src/
    │   ├── api/axios.js        # Axios instance with JWT interceptor
    │   ├── context/             # Auth + Cart React context
    │   ├── components/          # Navbar, Footer, ProductCard, route guards, etc.
    │   ├── pages/                # Home, Login, Products, Cart, Checkout, Orders, Profile
    │   └── pages/admin/           # Admin dashboard, products, orders, users, map view
    └── .env.example
```

---

## 2. Local setup

### Prerequisites
- Node.js 18+
- A MongoDB connection string (local `mongod` or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### Backend

```bash
cd backend
cp .env.example .env      # fill in MONGO_URI, JWT_SECRET, etc. (see section 4)
npm install
npm run seed               # creates an admin user + sample products (optional but recommended)
npm run dev                 # starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
cp .env.example .env       # set VITE_API_BASE_URL etc. (see section 4)
npm install
npm run dev                 # starts on http://localhost:5173
```