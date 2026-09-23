PROJECT: Simple E-Commerce Store

Build a full-stack e-commerce web application with product listings, a shopping cart, 
order processing, and user authentication.

═══════════════════════════════
TECH STACK
═══════════════════════════════
- Frontend: HTML, CSS, JavaScript (vanilla JS or a lightweight framework like React — 
  ask me which before starting if not specified)
- Backend: Express.js (Node.js)
- Database: MongoDB (use Mongoose as the ODM)
- Auth: Email/password (hashed with bcrypt, session/JWT-based) as the default method, 
  with Google OAuth 2.0 as an OPTIONAL secondary login method
- Environment config via .env (never hardcode secrets or DB URIs)

═══════════════════════════════
DESIGN & UI CONSTRAINTS (STRICT)
═══════════════════════════════
- NO gradients anywhere (backgrounds, buttons, cards, etc.)
- NO purple/violet color tones in the palette
- NO emojis used decoratively or unnecessarily in UI text, buttons, or headings
- Use a clean, neutral, minimal color palette (e.g. whites, grays, one accent color 
  like navy, forest green, or muted blue — solid colors only, no gradient fills)
- Clean, legible typography: use a well-paired system font stack or a single Google 
  Font (e.g. Inter, Manrope, or similar) for both headings and body text — no more 
  than 2 font families total
- Consistent spacing, clear visual hierarchy, generous whitespace
- Subtle page transitions between routes (fade/slide, ~150–250ms, no flashy or 
  bouncy animation) — use CSS transitions or a lightweight transition library, 
  avoid heavy animation libraries
- Client-side routing should feel smooth — no full page reloads/flicker between 
  views where avoidable
- Fully responsive (mobile, tablet, desktop)
- Accessible: proper contrast ratios, semantic HTML, keyboard-navigable forms

═══════════════════════════════
CORE FEATURES
═══════════════════════════════
1. Product Listings
   - Grid/list view of products with image, name, price, short description
   - Category/tag filtering and basic search
   - Pagination or infinite scroll

2. Product Details Page
   - Full description, price, stock availability, image(s)
   - Quantity selector
   - "Add to Cart" action
   - Route: /products/:id

3. Shopping Cart
   - Add/remove/update quantity
   - Persist cart per logged-in user (store in DB); for guests, persist in 
     localStorage until login/checkout
   - Cart summary with subtotal, item count
   - Route: /cart

4. User Registration/Login
   - Email + password signup and login (validate email format, enforce password 
     rules, hash passwords with bcrypt)
   - Optional: "Sign in with Google" (OAuth 2.0) as an alternate button on the 
     same login screen
   - Session handling via JWT (httpOnly cookies preferred) or express-session
   - Protected routes for cart, checkout, order history, profile

5. Order Processing
   - Checkout flow: review cart → shipping details → confirm order
   - Create Order record in DB tied to user, with line items, quantities, prices, 
     total, and status (e.g. pending, confirmed, shipped, delivered, cancelled)
   - Reduce product stock on successful order
   - Order confirmation page + order history page for logged-in users
   - Mock/stub payment step is fine (no real payment gateway required unless 
     specified) — structure it so Stripe/Razorpay could be added later

═══════════════════════════════
DATABASE SCHEMA (MongoDB / Mongoose)
═══════════════════════════════
- User: name, email (unique), passwordHash, googleId (optional), createdAt
- Product: name, description, price, images[], category, stock, createdAt
- Cart: userId, items: [{ productId, quantity }], updatedAt
- Order: userId, items: [{ productId, name, price, quantity }], totalAmount, 
  shippingAddress, status, createdAt

═══════════════════════════════
API STRUCTURE (Express)
═══════════════════════════════
- /api/auth/register, /api/auth/login, /api/auth/google, /api/auth/logout
- /api/products (GET list, GET by id), /api/products/:id
- /api/cart (GET, POST add item, PUT update qty, DELETE remove item)
- /api/orders (POST create order, GET user's orders, GET single order)
- Use middleware for auth verification on protected routes
- Return consistent JSON error responses with proper HTTP status codes

═══════════════════════════════
FRONTEND ROUTES
═══════════════════════════════
/            → Home / product listing
/products/:id → Product detail
/cart        → Shopping cart
/checkout    → Checkout flow
/login       → Login (email + optional Google button)
/register    → Registration
/orders      → Order history (protected)
/profile     → User profile (protected)

═══════════════════════════════
NON-FUNCTIONAL REQUIREMENTS
═══════════════════════════════
- Input validation and sanitization on both frontend and backend
- Basic error handling and user-friendly error messages (no raw stack traces in UI)
- Loading and empty states for all data-fetching views
- .env.example file listing required environment variables
- README with setup instructions (install, env setup, run dev server, seed DB)
- Seed script to populate sample products for testing

═══════════════════════════════
DELIVERABLE
═══════════════════════════════
Organize as a monorepo or /client + /server structure. Prioritize working core 
flows (browse → add to cart → checkout → order created) over extra polish. 
Ask clarifying questions only if something above is ambiguous — otherwise proceed 
with reasonable defaults.