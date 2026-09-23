# Deployment Guide: Production E-Commerce Platform

This repository is organized into a clean decoupled architecture:
- **`frontend/`**: Next.js App Router (Storefront, Admin UI, Zustand, Recharts, Stripe Elements)
- **`backend/`**: Express + TypeScript REST API (Prisma ORM, PostgreSQL, Stripe Webhook, JWT RBAC)

---

## 1. Quickstart with Docker Compose (Local or VPS)

To spin up the entire stack locally or on a virtual machine (EC2, DigitalOcean, Hetzner):

```bash
# 1. Clone & copy environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Build and launch PostgreSQL, Backend, and Frontend
docker compose up --build -d

# 3. Verify running containers
docker compose ps
```

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/health`

---

## 2. Deploying the Backend API (Render / Railway / Fly.io)

### Option A: Render (One-Click Blueprint)
1. Push this repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com), click **New +** -> **Blueprint**.
3. Select this repository. Render will detect `render.yaml` and automatically configure:
   - A managed **PostgreSQL Database** (`ecommerce-postgres`)
   - A **Node Web Service** pointing to `backend/`
4. Provide your Stripe keys in the environment variables prompt.
5. Once deployed, copy your backend URL (e.g., `https://ecommerce-backend-api.onrender.com`).

### Option B: Railway
1. In [Railway.app](https://railway.app), click **New Project** -> **Provision PostgreSQL**.
2. Click **New Service** -> **GitHub Repo** -> select your repo.
3. Set the **Root Directory** to `backend`.
4. Add environment variables:
   - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}`
   - `JWT_SECRET`: Generate a secure 32+ character string
   - `STRIPE_SECRET_KEY`: `sk_live_...` or `sk_test_...`
   - `STRIPE_WEBHOOK_SECRET`: `whsec_...`
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g. `https://your-store.vercel.app`)

---

## 3. Deploying the Frontend (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com) and click **Add New Project**.
2. Select your repository.
3. In the project setup screen:
   - **Root Directory**: Click edit and select `frontend`.
   - **Framework Preset**: Next.js (automatically detected).
4. In **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: Your deployed backend URL + `/api` (e.g. `https://ecommerce-backend-api.onrender.com/api`)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: `pk_live_...` or `pk_test_...`
   - `NEXTAUTH_SECRET`: Random 32+ character string
   - `NEXTAUTH_URL`: Your production Vercel domain (e.g. `https://your-store.vercel.app`)
5. Click **Deploy**.

---

## 4. Production Database Migration & Seeding

After your production database is online:

```bash
cd backend

# Run migrations against production database
DATABASE_URL="your-production-database-url" npx prisma migrate deploy

# Seed initial admin and product catalog
DATABASE_URL="your-production-database-url" npx tsx prisma/seed.ts
```

**Default Admin Credentials**:
- **Email**: `admin@store.com`
- **Password**: `AdminPass123!`

---

## 5. Stripe Production Webhook Configuration

1. In [Stripe Dashboard](https://dashboard.stripe.com/webhooks), click **Add destination / endpoint**.
2. Endpoint URL: `https://your-backend-domain.com/api/webhooks/stripe`
3. Events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the **Signing secret** (`whsec_...`) into your backend environment variable: `STRIPE_WEBHOOK_SECRET`.
