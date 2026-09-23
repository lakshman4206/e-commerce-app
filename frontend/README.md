# Production-Ready Full-Stack E-Commerce Platform

An enterprise-grade, production-ready Full-Stack E-Commerce platform featuring an integrated Admin Dashboard.

Built with **Next.js (App Router, Server Components)**, **TypeScript**, **PostgreSQL**, **Prisma ORM**, **NextAuth.js v5 (RBAC)**, **Stripe API**, **Tailwind CSS**, and **Recharts**.

---

## Architecture Highlights

1. **Role-Based Access Control (RBAC)**:
   - Built with NextAuth v5 and JWT sessions.
   - Enforces edge-level middleware (`middleware.ts`) route protection.
   - Restricts `/admin/*` solely to accounts with role `ADMIN`, redirecting unauthorized users to `/unauthorized` (403) or `/login`.
2. **Atomic Inventory & Payment Settlement**:
   - High-integrity Stripe Webhook handler (`/api/webhooks/stripe`) parsing raw body stream.
   - Uses atomic database transaction (`prisma.$transaction`) to transition orders to `PAID`, decrement item inventory levels, and clear user shopping carts.
3. **Executive Admin Telemetry**:
   - Dedicated Admin Control Center (`/admin`) displaying KPIs: Total Revenue, Total Orders, Total Registered Customers, and Low Stock Alerts (< 5 units).
   - Recharts visual analytics: Monthly Revenue Trajectory (Bar Chart) and Category Distribution (Pie Chart).
4. **Modern Storefront Customer Journey**:
   - Responsive Hero Banner, Category navigation pills, and signature product showcases.
   - Zustand cart state with `localStorage` persistence and slide-over Cart Drawer.
   - Stripe Elements integration with pre-filled test card switcher for testing.

---

## Project Structure

```text
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (storefront)/
│   │   ├── layout.tsx                # Customer shell (Navbar, CartDrawer, Footer)
│   │   ├── page.tsx                  # Home page
│   │   ├── products/page.tsx         # Catalog with filters & sorting
│   │   ├── checkout/page.tsx         # Stripe checkout
│   │   ├── checkout/success/page.tsx # Order confirmation receipt
│   │   └── orders/page.tsx           # Order history
│   ├── admin/
│   │   ├── layout.tsx                # Admin shell (Sidebar & RBAC check)
│   │   ├── page.tsx                  # Analytics Dashboard
│   │   ├── products/page.tsx         # Product management & stock alerts
│   │   └── orders/page.tsx           # Order fulfillment pipeline
│   ├── api/
│   │   ├── auth/[...nextauth]/       # NextAuth v5 API
│   │   ├── checkout/create-intent/   # Stripe PaymentIntent handler
│   │   └── webhooks/stripe/          # Atomic Stripe Webhook handler
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── admin/                        # Admin widgets & charts
│   ├── storefront/                   # Storefront components
│   └── ui/                           # UI primitives
├── actions/
│   ├── analytics.ts                  # Metric aggregation Server Action
│   ├── products.ts                   # Product CRUD Server Actions
│   └── orders.ts                     # Order mutation Server Actions
├── lib/
│   ├── auth.ts                       # NextAuth v5 configuration
│   ├── db.ts                         # Prisma client singleton
│   ├── stripe.ts                     # Stripe Node client
│   └── utils.ts                      # Formatting & helper utilities
├── store/
│   └── use-cart-store.ts             # Zustand cart store
├── prisma/
│   ├── schema.prisma                 # Relational PostgreSQL schema
│   └── seed.ts                       # Database seeder
└── middleware.ts                     # Edge RBAC middleware
```

---

## Setup & Quickstart

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update your PostgreSQL `DATABASE_URL` and Stripe keys in `.env`.

### 3. Generate Prisma Client & Run Migrations
```bash
# Generate Prisma Client
npx prisma generate

# Apply migrations
npx prisma migrate dev --name init

# Seed initial admin, customer, categories, and products
npm run prisma:seed
```

### 4. Default Seeded Credentials
- **Admin**: `admin@store.com` | Password: `AdminPass123!`
- **Customer**: `customer@gmail.com` | Password: `CustomerPass123!`

---

## Local Stripe Webhook Testing

1. Log in to Stripe CLI:
   ```bash
   stripe login
   ```
2. Forward events to local Next.js server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
3. Set the printed webhook signing secret in your `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```
4. Trigger a simulated test payment:
   ```bash
   stripe trigger payment_intent.succeeded
   ```
5. Test Card Details:
   - Card Number: `4242 4242 4242 4242`
   - Exp: Any future date (e.g. `12/28`)
   - CVC: `123`
