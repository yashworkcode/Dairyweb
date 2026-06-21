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

Open `http://localhost:5173`. Log in with the username/email and password set via `ADMIN_USERNAME` /
`ADMIN_EMAIL` / `ADMIN_PASSWORD` in the backend `.env` to access `/admin`.

> **Local OTP note:** If you don't configure SMTP credentials, signup verification OTP codes are printed
> to the **backend terminal console** instead of being emailed — this keeps local development friction-free.

---

## 3. Authentication flow

| Method | Endpoint(s) | Notes |
|---|---|---|
| Signup (Email OTP verified) | `POST /api/auth/send-otp` → `POST /api/auth/register` | Collects name, username, email; sends a 6-digit email OTP (5-minute TTL) to verify the address, then creates the account with a bcrypt-hashed password. |
| Login | `POST /api/auth/login` | `{ identifier, password }` — `identifier` can be the **username or email**. Compares the password with `bcrypt.compare()`. |
| Google OAuth | `POST /api/auth/google-login` | Frontend uses `@react-oauth/google`'s `GoogleLogin` button to get an ID token; backend verifies it with `google-auth-library` against `GOOGLE_CLIENT_ID` and auto-creates an account (with an auto-generated username) on first sign-in. |

All successful logins return a JWT (`{ id, role }` payload) that the frontend stores in `localStorage`
and attaches as `Authorization: Bearer <token>` on every API request. Roles are `user` and `admin`;
admin-only routes are protected server-side by the `adminOnly` middleware, **not just hidden in the UI**.
Phone-number-based login has been fully removed — phone is no longer required anywhere in auth.

To enable Google login for real:
1. Create an OAuth Client ID (type "Web application") in [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Add your frontend URLs (e.g. `http://localhost:5173`, your Vercel domain) to "Authorized JavaScript origins".
3. Put the client ID in **both** `backend/.env` (`GOOGLE_CLIENT_ID`) and `frontend/.env` (`VITE_GOOGLE_CLIENT_ID`).

To enable real email OTP delivery:
- Fill in `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` in `backend/.env` (any SMTP provider — Gmail app password, SendGrid, Mailgun, etc.).

---

## 4. Environment variables

### `backend/.env`
| Variable | Description |
|---|---|
| `PORT` | Server port (Render sets this automatically in production) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string used to sign JWTs |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `30d` |
| `FRONTEND_URL` | **Comma-separated** list of allowed CORS origins, e.g. `http://localhost:5173,https://your-app.vercel.app` |
| `ADMIN_NAME` / `ADMIN_USERNAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used once by `npm run seed` to create the first admin account (password is bcrypt-hashed before saving) |
| `SMTP_*` | Optional — email OTP delivery (signup verification) |
| `GOOGLE_CLIENT_ID` | Required for Google login verification |

### `frontend/.env`
| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL, e.g. `http://localhost:5000/api` or `https://your-api.onrender.com/api` |
| `VITE_GOOGLE_CLIENT_ID` | Same Google OAuth client ID as the backend |
| `VITE_WHATSAPP_NUMBER` | WhatsApp number (with country code, no `+`/spaces) used by the floating chat button and order-confirmation message |

**Never hardcode URLs in code** — both the CORS allow-list and the API base URL are environment-driven so the same code works locally and in production.

---

## 5. API reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/send-otp` | — | `{ identifier, channel: "email" }` → sends a signup verification OTP |
| POST | `/api/auth/register` | — | `{ name, username, email, password, otp }` → creates the account |
| POST | `/api/auth/login` | — | `{ identifier, password }` (`identifier` = username or email) → `{ token, user }` |
| POST | `/api/auth/google-login` | — | `{ idToken }` → `{ token, user }` |
| GET | `/api/auth/me` | User | Current user profile |

### Products
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | — | `?category=&search=` |
| GET | `/api/products/:id` | — | Single product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product / price |
| DELETE | `/api/products/:id` | Admin | Delete product |

### Orders
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/orders` | User | `{ items: [{productId, quantity}], fullName, phone, email, address, subscriptionType, paymentMethod }` |
| GET | `/api/orders/user` | User | Logged-in user's order history |
| GET | `/api/orders/admin` | Admin | All orders, `?status=Pending\|Processing\|Delivered\|Cancelled` |
| PUT | `/api/orders/status/:id` | Admin | `{ status }` |
| GET | `/api/orders/:id` | Owner/Admin | Single order detail |

### Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users` | Admin | List all users |
| GET | `/api/users/admin/analytics` | Admin | Dashboard totals + status breakdown |
| POST | `/api/users/address` | User | Save an address (auto-generates the Google Maps link) |
| DELETE | `/api/users/address/:addressId` | User | Remove a saved address |

---

## 6. Google Maps integration

Every address (checkout form and saved profile addresses) automatically generates:
```
https://www.google.com/maps/search/?api=1&query=<url-encoded address>
```
shown to the user as an **"Open in Google Maps"** link/button — no API key required for this link format.

The admin **Delivery Map** page (`/admin/maps`) additionally embeds a live map preview per order using
the no-key `https://maps.google.com/maps?q=...&output=embed` format, with a fallback "Open in Google Maps" link.
For a fully-branded interactive map (clustering, custom pins, directions), swap this for the
[Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript) with a billing-enabled API key.

---

## 7. Deployment

### Database — MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Add a database user and allow access from anywhere (`0.0.0.0/0`) or Render's IPs.
3. Copy the connection string into `MONGO_URI`.

### Backend — Render
1. Push this repo to GitHub.
2. New **Web Service** on [Render](https://render.com), root directory `backend`.
3. Build command: `npm install` · Start command: `npm start`.
4. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL` (your Vercel URL), `GOOGLE_CLIENT_ID`, SMTP vars if used, plus `ADMIN_*` vars for the seed script.
5. After the first deploy, run the seed script once via Render's shell: `npm run seed`.

### Frontend — Vercel
1. New project on [Vercel](https://vercel.com), root directory `frontend`.
2. Framework preset: **Vite**.
3. Add environment variables: `VITE_API_BASE_URL` (your Render URL + `/api`), `VITE_GOOGLE_CLIENT_ID`, `VITE_WHATSAPP_NUMBER`.
4. Deploy. The included `vercel.json` ensures client-side routes (e.g. `/products`) don't 404 on refresh.
5. Once you have the live Vercel URL, add it to the backend's `FRONTEND_URL` env var on Render and redeploy the backend.

### CORS checklist (no surprises in production)
- `FRONTEND_URL` on the backend must list **every** origin that calls the API (comma-separated), including `http://localhost:5173` for local dev and your `https://*.vercel.app` domain.
- The backend never hardcodes an origin — it reads `process.env.FRONTEND_URL` at boot.
- `credentials: true` is set, and the frontend's axios instance sends the JWT via the `Authorization` header (not cookies), so no extra cookie/SameSite configuration is needed.

---

## 8. Default admin login

After running `npm run seed`, log in with the username/email and password set in `ADMIN_USERNAME` /
`ADMIN_EMAIL` / `ADMIN_PASSWORD` (defaults: `admin` / `admin@vaishnavimilkdairy.com` / `ChangeMe@123`)
on the **Log in** tab. The seeded account already has `role: "admin"`, so you'll be redirected into `/admin`.

> ⚠️ **Change `ADMIN_PASSWORD` before deploying.** The default password is only meant for local testing.

---

## 9. What's mocked vs. production-ready

- **Production-ready as-is:** JWT auth, role-based access control, MongoDB models/indexes, CORS via env vars, cart/subscription/order logic, Google OAuth verification, Google Maps link generation, responsive UI.
- **Needs your own credentials before going live:** a real SMTP account for OTP delivery (falls back to console logging), a real Google OAuth client ID, a strong `ADMIN_PASSWORD`/`JWT_SECRET`, and — if you want online payments rather than Cash on Delivery — a payment gateway (Razorpay/Stripe) integrated into the `paymentMethod: "Online"` flow in `orderController.js`.
