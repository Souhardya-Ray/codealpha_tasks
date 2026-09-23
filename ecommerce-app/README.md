# Simple E-Commerce Store

Full-stack demo: product listings, cart, checkout, and email/password auth.

Stack: Express + MongoDB (Mongoose) on the backend, plain HTML/CSS/JavaScript
with hash-based client-side routing on the frontend (no build step needed).

## Project layout

```
ecommerce-app/
  server/   Express API (port 5000)
  client/   Static frontend (open directly or serve on port 3000)
```

## 1. Backend setup

```bash
cd server
npm install
cp .env.example .env
# edit .env: set MONGO_URI to your MongoDB connection string,
# and JWT_SECRET to a long random string
npm run seed   # populates 12 sample products
npm run dev    # starts the API on http://localhost:5000 (needs nodemon, included)
# or: npm start
```

You need a MongoDB instance running — either local (`mongodb://localhost:27017/ecommerce`)
or a free MongoDB Atlas cluster (paste its connection string into `MONGO_URI`).

## 2. Frontend setup

The client is static files — no build step. Easiest way to serve it so
`fetch` and cookies behave correctly:

```bash
cd client
npx serve -l 3000
# or: python3 -m http.server 3000
```

Then open http://localhost:3000. The client calls the API at
`http://localhost:5000/api` (see `client/js/api.js` — change `API_BASE` if
your server runs elsewhere), and the server's `CLIENT_ORIGIN` in `.env` must
match the origin the client is served from for cookies/CORS to work.

## What's implemented

- Product listing with search + category filter, and product detail pages
- Cart: DB-backed for logged-in users, localStorage for guests, merged into
  the DB cart automatically on login/register
- Email/password auth: bcrypt-hashed passwords, JWT in an httpOnly cookie
- Checkout flow that creates an Order, decrements product stock, and clears
  the cart; order confirmation + order history pages
- Google OAuth is stubbed (`POST /api/auth/google` returns 501) — see the
  comment in `server/routes/auth.js` for how to wire it up
- Payment is stubbed — placing an order confirms it immediately; the order
  flow is structured so a real gateway (Stripe/Razorpay) could sit in front
  of `POST /api/orders` later

## Design constraints followed

No gradients, no purple/violet tones, no decorative emoji. Palette is
white/gray with a single forest-green accent. Inter for all typography.
Views fade between hash routes (~150-200ms) instead of reloading the page.

## Known limitations (kept intentionally simple)

- No product images (placeholder boxes) — the schema supports an `images[]`
  array, so this is just a matter of uploading/hosting and passing URLs in
- No admin UI for managing products (use the seed script or MongoDB Compass)
- No pagination controls in the UI yet, though the API supports `page`/`limit`
