<div align="center">

# 🛍️ HamroPasal

### A full-stack, multi-vendor e-commerce marketplace built for Nepal 🇳🇵

*Browse, sell, and manage — three storefronts, one platform.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)](https://neon.tech/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Redis](https://img.shields.io/badge/Redis-Cloud-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-monorepo-EF4444?logo=turborepo&logoColor=white)](https://turbo.build/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 🌐 Live Demo

| App | Description | URL |
| --- | --- | --- |
| 🛒 **Storefront (Web)** | Customer shopping experience | **[hamropasal-alpha.vercel.app](https://hamropasal-alpha.vercel.app)** |
| 🏪 **Seller Dashboard** | Vendor / store management | **[hamropasal-seller.vercel.app](https://hamropasal-seller.vercel.app)** |
| 🛡️ **Admin Panel** | Platform administration | **[hamropasal-admin.vercel.app](https://hamropasal-admin.vercel.app)** |
| ⚙️ **API** | REST API + Swagger docs | **[hamropasal-4kd8.onrender.com](https://hamropasal-4kd8.onrender.com)** · [`/docs`](https://hamropasal-4kd8.onrender.com/docs) · [`/reference`](https://hamropasal-4kd8.onrender.com/reference) |

> ⏳ **Heads-up:** the API is hosted on a free Render instance that sleeps after ~15 minutes of inactivity. The **first request after a cold start takes ~30–50s to wake the server** — the apps show a "waking up our server" notice and skeleton loaders while it boots. Subsequent requests are fast.

### 🔑 Demo accounts

Log in on the matching app to explore each role end-to-end.

| Role | App | Email | Password |
| --- | --- | --- | --- |
| 🛡️ Admin | Admin panel | `admin@hamropasal.com` | `Admin@12345` |
| 🏪 Seller | Seller dashboard | `everest@hamropasal.com` | `Seller@12345` |
| 🏪 Seller (alt) | Seller dashboard | `gadget@hamropasal.com` | `Seller@12345` |
| 🛒 Customer | Storefront | `customer1@hamropasal.com` | `Customer@12345` |
| 🛒 Customer (alt) | Storefront | `customer2@hamropasal.com` | `Customer@12345` |

<sub>Additional seeded sellers: `kicks@`, `himalaya@`, `glow@`, `newa@hamropasal.com` (password `Seller@12345`). Customers `customer1@` … `customer15@hamropasal.com` (password `Customer@12345`).</sub>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Screenshots](#-screenshots)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Database Design (ER Diagrams)](#-database-design-er-diagrams)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Scripts](#-project-scripts)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🧭 Overview

**HamroPasal** ("our shop" in Nepali) is a production-grade, **multi-vendor marketplace** modelled on platforms like Daraz — where many independent sellers list products under one storefront, customers shop across all of them in a single cart, and each order is automatically split into per-seller sub-orders with commission and payouts handled by the platform.

It's built as a **Turborepo monorepo** with **three separate frontends** (customer, seller, admin) backed by a **single API** that talks to a **polyglot persistence layer** — PostgreSQL for transactional/relational data, MongoDB for the flexible product catalog, and Redis for sessions, OTPs, and background jobs.

**Key domain capabilities**

- 🧑‍🤝‍🧑 **Multi-vendor** — one order spans multiple stores, split into sub-orders with per-store commission & seller earnings.
- 💳 **Nepali payments** — eSewa, Khalti, and Cash-on-Delivery flows (plus Stripe scaffolding).
- 🎟️ **Loyalty & coupons** — points earned/redeemed per order; platform- and store-level coupons with redemption limits.
- 💬 **Real-time** — customer↔seller chat, product Q&A, and live notifications over Socket.io.
- 🔐 **Audience-scoped auth** — web, seller, and admin sessions are fully isolated even though they share one API.

---

## 📸 Screenshots

> Drop your images into `docs/screenshots/` using the filenames below and they'll render here.

| Storefront | Product detail |
| --- | --- |
| ![Storefront home](docs/screenshots/web-home.png) | ![Product detail](docs/screenshots/web-product.png) |

| Cart & checkout | Seller dashboard |
| --- | --- |
| ![Checkout](docs/screenshots/web-checkout.png) | ![Seller dashboard](docs/screenshots/seller-dashboard.png) |

| Store page | Admin panel |
| --- | --- |
| ![Store page](docs/screenshots/web-store.png) | ![Admin panel](docs/screenshots/admin-dashboard.png) |

| Mobile storefront | Real-time chat |
| --- | --- |
| ![Mobile](docs/screenshots/web-mobile.png) | ![Chat](docs/screenshots/seller-chat.png) |

---

## ✨ Features

### 🛒 Customer storefront (`apps/web`)
- Public browsing of products, categories, stores, and search (login **not** required to browse).
- **Option-based product variants** — size / color / RAM etc., each combination with its own price & stock.
- Cart, wishlist, multi-store checkout, address book with delivery zones & shipping fees.
- Payments via **eSewa / Khalti / COD**; order tracking with status timeline.
- **Loyalty points** & coupon redemption at checkout.
- Verified reviews & ratings, product Q&A, and real-time chat with sellers.
- Web-push & in-app notifications, fully **responsive / mobile-optimized** UI with a bottom nav.

### 🏪 Seller dashboard (`apps/seller` · port 3001)
- Store onboarding & profile (logo, cover, address, delivery zones).
- Product CRUD with variants, images (Cloudinary), and stock management.
- Order & sub-order fulfillment, returns handling, and earnings/payout tracking.
- Customer chat, product-question answering, and notifications.
- Sales analytics for the store.

### 🛡️ Admin panel (`apps/admin` · port 3002)
- User, store, and catalog moderation (approve / suspend stores → product visibility syncs automatically).
- Category management, platform-wide coupons, and commission configuration.
- Order oversight, payouts, returns, and platform analytics.

### 🔒 Cross-cutting
- **Audience-scoped sessions** — `web` / `seller` / `admin` tokens & refresh cookies are isolated per app (a token minted for one app is rejected by another).
- In-memory access token + httpOnly refresh cookie rotation; email OTP verification.
- Google OAuth login.
- **OpenAPI docs** — Swagger UI at `/docs`, Scalar reference at `/reference`.
- Background email queue (BullMQ + Redis), transactional email via Gmail SMTP (nodemailer).

---

## 🧰 Tech Stack

| Layer | Technologies |
| --- | --- |
| **Monorepo** | Turborepo · npm workspaces · TypeScript |
| **Frontends** | Next.js 14 (App Router) · React 18 · Tailwind CSS · Zustand · TanStack Query · Socket.io-client |
| **API** | Node.js 20 · Express · Socket.io · Zod · Passport (Google OAuth) · JWT · BullMQ |
| **Databases** | PostgreSQL (Neon) via **Prisma 7** · MongoDB (Atlas) via **Mongoose** · Redis (Redis Cloud) via ioredis |
| **Media & Email** | Cloudinary (images) · Nodemailer / Gmail SMTP · Web Push (VAPID) |
| **Payments** | eSewa · Khalti · Cash on Delivery · Stripe (scaffolded) |
| **Hosting** | Vercel (3 frontends) · Render (API) · Neon · MongoDB Atlas · Redis Cloud |

---

## 🏗️ Architecture

```
                         ┌──────────────────────────────────────────────┐
                         │                  CLIENTS                       │
                         │                                                │
   apps/web (Vercel) ────┤  apps/seller (Vercel)   apps/admin (Vercel)   │
   customer storefront   │  seller dashboard       admin panel           │
                         └───────────────┬──────────────────────────────┘
                                         │  HTTPS (REST)  +  WSS (Socket.io)
                                         │  audience = web | seller | admin  (from Origin)
                                         ▼
                         ┌──────────────────────────────────────────────┐
                         │        apps/api  (Express + Socket.io)        │
                         │   auth · catalog · orders · payments · chat   │
                         │   reviews · coupons · loyalty · notifications │
                         │              BullMQ email worker              │
                         └───────┬───────────────┬───────────────┬──────┘
                                 │               │               │
                    ┌────────────▼───┐   ┌───────▼───────┐   ┌───▼───────────┐
                    │  PostgreSQL    │   │   MongoDB     │   │     Redis      │
                    │   (Neon)       │   │   (Atlas)     │   │  (Redis Cloud) │
                    │ Prisma 7       │   │  Mongoose     │   │  sessions/OTP  │
                    │ users, orders, │   │ products,     │   │  BullMQ queue  │
                    │ payments,      │   │ categories,   │   │                │
                    │ payouts...     │   │ reviews, chat │   │                │
                    └────────────────┘   └───────────────┘   └───────────────┘
```

### Why polyglot persistence?

- **PostgreSQL** holds everything **transactional & relational** — users, stores, orders, sub-orders, payments, payouts, coupons, loyalty — where integrity and foreign keys matter.
- **MongoDB** holds the **product catalog & content** — products (with deeply nested variants/attributes), categories, reviews, carts, wishlists, chat, and notifications — where schema flexibility and document shape win.
- **Redis** holds **ephemeral & infrastructure** state — refresh-token sessions, email OTPs, and the BullMQ job queue.

Cross-store references (e.g. a Mongo `Product.storeId` or `Review.userId`) hold the **Postgres UUID** as a plain string — the two databases are linked by ID at the application layer, not by a database-level foreign key.

### Monorepo layout

```
.
├── apps/
│   ├── api/        # Express + Socket.io API (Prisma + Mongoose + Redis)
│   ├── web/        # Next.js 14 customer storefront
│   ├── seller/     # Next.js 14 seller dashboard  (:3001)
│   └── admin/      # Next.js 14 admin panel        (:3002)
├── packages/
│   └── shared-types/   # types shared across apps
├── turbo.json
└── package.json    # npm workspaces + turbo scripts
```

---

## 🗄️ Database Design (ER Diagrams)

### PostgreSQL — transactional core (Prisma)

```mermaid
erDiagram
    User ||--o{ OAuthAccount : has
    User ||--o{ Address : has
    User ||--o| Store : owns
    User ||--o{ Order : places
    User ||--o{ LoyaltyTransaction : earns
    User ||--o{ CouponRedemption : redeems

    Store ||--o{ DeliveryZone : defines
    Store ||--o{ SubOrder : fulfills
    Store ||--o{ Payout : receives

    Order ||--o{ SubOrder : "split into"
    Order ||--o| Payment : "paid by"
    Order }o--o| Address : "ships to"
    Order }o--o| Coupon : "uses"

    SubOrder ||--o{ OrderItem : contains
    SubOrder ||--o| Payout : "settled by"
    SubOrder ||--o{ Return : "may have"

    Coupon ||--o{ CouponRedemption : "tracked by"

    User {
        uuid id PK
        string email UK
        string password "nullable (OAuth)"
        string name
        enum role "CUSTOMER|SELLER|ADMIN"
        boolean isEmailVerified
        boolean isActive
    }
    OAuthAccount {
        uuid id PK
        uuid userId FK
        enum provider "GOOGLE"
        string providerId
    }
    Address {
        uuid id PK
        uuid userId FK
        string fullName
        string addressLine
        string city
        string district
        float latitude
        float longitude
        boolean isDefault
    }
    Store {
        uuid id PK
        uuid ownerId FK,UK
        string name
        string slug UK
        enum status "PENDING|ACTIVE|SUSPENDED"
        float commissionRate
    }
    DeliveryZone {
        uuid id PK
        uuid storeId FK
        string name
        float distanceKm
        float shippingFee
    }
    Order {
        uuid id PK
        uuid userId FK
        uuid addressId FK "nullable"
        uuid couponId FK "nullable"
        float totalAmount
        float shippingFee
        float discountAmount
        int loyaltyPointsUsed
        enum status "OrderStatus"
        enum paymentStatus "PaymentStatus"
        enum paymentMethod "COD|KHALTI|ESEWA|STRIPE"
    }
    SubOrder {
        uuid id PK
        uuid orderId FK
        uuid storeId FK
        float subtotal
        float shippingFee
        float commissionFee
        float sellerEarning
        enum status "OrderStatus"
    }
    OrderItem {
        uuid id PK
        uuid subOrderId FK
        string productId "Mongo id"
        string variantId "nullable"
        string name
        float price
        int quantity
    }
    Payment {
        uuid id PK
        uuid orderId FK,UK
        enum method "PaymentMethod"
        enum status "PaymentStatus"
        float amount
        string currency "NPR"
        string gatewayRef
        json gatewayResponse
        datetime paidAt
    }
    Coupon {
        uuid id PK
        string code UK
        string discountType "PERCENTAGE|FLAT"
        float discountValue
        float minOrderAmount
        float maxDiscount
        int usageLimit
        int usedCount
        string storeId "nullable"
    }
    CouponRedemption {
        uuid id PK
        uuid couponId FK
        uuid userId FK
        uuid orderId "nullable"
    }
    LoyaltyTransaction {
        uuid id PK
        uuid userId FK
        int points
        string type "EARNED|REDEEMED|EXPIRED|BONUS"
        string orderId "nullable"
    }
    Payout {
        uuid id PK
        uuid storeId FK
        uuid subOrderId FK,UK
        float amount
        enum status "PayoutStatus"
        datetime processedAt
    }
    Return {
        uuid id PK
        uuid subOrderId FK
        string reason
        enum status "ReturnStatus"
        float refundAmount
    }
```

### MongoDB — catalog, content & messaging (Mongoose)

```mermaid
erDiagram
    Category ||--o{ Category : "parent of"
    Category ||--o{ Product : categorizes
    Product ||--o{ Review : "reviewed in"
    Product ||--o{ Question : "asked about"
    Conversation ||--o{ Message : contains
    Cart ||--o{ CartItem : holds
    Product ||--o{ Variant : "has (embedded)"

    Category {
        objectId _id PK
        string name
        string slug UK
        objectId parentId FK "self, nullable"
        boolean isActive
        int sortOrder
    }
    Product {
        objectId _id PK
        string storeId "→ pg Store.id"
        objectId categoryId FK
        string name
        string slug UK
        float price
        float comparePrice
        int stock
        string tags "array"
        boolean isActive
        boolean storeActive "denormalized"
        float avgRating
        int reviewCount
        int soldCount
    }
    Variant {
        string name
        float price
        float comparePrice
        int stock
        string sku
        map attributes "e.g. {size, color}"
    }
    Review {
        objectId _id PK
        objectId productId FK
        string userId "→ pg User.id"
        string storeId "→ pg Store.id"
        string subOrderId "→ pg SubOrder.id"
        int rating "1-5"
        string comment
        boolean isVerifiedPurchase
        boolean isApproved
    }
    Question {
        objectId _id PK
        objectId productId FK
        string storeId "→ pg Store.id"
        string userId "→ pg User.id (asker)"
        string question
        string answer
        string answeredBy
    }
    Cart {
        objectId _id PK
        string userId UK "→ pg User.id"
    }
    CartItem {
        objectId productId FK
        string variantId
        string name
        float price
        int quantity
        string storeId
    }
    Wishlist {
        objectId _id PK
        string userId UK "→ pg User.id"
        objectId products FK "array of refs"
    }
    Conversation {
        objectId _id PK
        string customerId "→ pg User.id"
        string storeId "→ pg Store.id"
        string sellerId "→ pg User.id"
        int customerUnread
        int sellerUnread
    }
    Message {
        objectId _id PK
        objectId conversationId FK
        string senderId
        string senderRole "CUSTOMER|SELLER"
        string text
        boolean isRead
    }
    Notification {
        objectId _id PK
        string userId "→ pg User.id"
        string type
        string title
        string body
        boolean isRead
    }
    PushSubscription {
        objectId _id PK
        string userId "→ pg User.id"
        string endpoint UK
    }
```

> `"→ pg X.id"` denotes an application-level reference to a **PostgreSQL** row (stored as a string UUID), not a Mongo `ObjectId` foreign key. `Variant` and `CartItem` are **embedded sub-documents**, not separate collections.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js ≥ 20** and **npm ≥ 10**
- A **PostgreSQL** database (e.g. [Neon](https://neon.tech) free tier)
- A **MongoDB** database (e.g. [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)
- A **Redis** instance (e.g. [Redis Cloud](https://redis.io/cloud/) free tier)
- *(Optional)* Cloudinary, Google OAuth, and a Gmail App Password for full functionality

### 1. Clone & install

```bash
git clone https://github.com/<your-username>/hamropasal.git
cd hamropasal
npm install
```

### 2. Configure environment

Create a `.env` file in the repo root (used by the API + Prisma). See [Environment Variables](#-environment-variables) below for the full list.

### 3. Set up the databases

```bash
# Apply Postgres schema (Prisma migrations)
cd apps/api
npx prisma migrate deploy     # or: npx prisma migrate dev
npx prisma generate

# (Optional) seed demo data — categories, stores, products, customers, reviews
npm run seed
```

### 4. Run everything

```bash
# from the repo root — starts api + web + seller + admin via Turborepo
npm run dev
```

| App | URL |
| --- | --- |
| Storefront (web) | http://localhost:3000 |
| Seller dashboard | http://localhost:3001 |
| Admin panel | http://localhost:3002 |
| API | http://localhost:4000 · docs at `/docs` |

Or run a single app:

```bash
npm run dev:api      # API only
npm run dev:web      # storefront only
npm run dev:seller   # seller dashboard only
npm run dev:admin    # admin panel only
```

---

## 🔧 Environment Variables

The **API** reads these from the root `.env`. The **frontends** read `NEXT_PUBLIC_*` vars (set per app in Vercel / `.env.local`).

### API (`.env`)

```dotenv
# Core
NODE_ENV=development
PORT=4000
SERVER_URL=http://localhost:4000

# Frontend origins (CORS + audience scoping) — MUST match deployed URLs in prod, no trailing slash
CLIENT_URL=http://localhost:3000
SELLER_URL=http://localhost:3001
ADMIN_URL=http://localhost:3002

# Databases
DATABASE_URL=postgresql://...        # Neon (pooled)
DIRECT_URL=postgresql://...          # Neon (direct, for migrations)
MONGODB_URI=mongodb+srv://...        # Atlas
REDIS_URL=redis://default:...@host:port

# Auth
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback

# Media (Cloudinary)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=you@gmail.com
SMTP_PASS=your_16_char_app_password
EMAIL_FROM=you@gmail.com

# Payments
KHALTI_BASE_URL=https://dev.khalti.com/api/v2
ESEWA_BASE_URL=https://rc-epay.esewa.com.np
ESEWA_SUCCESS_URL=...
ESEWA_FAILURE_URL=...

# Web Push
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:admin@hamropasal.com
```

### Frontends (per app)

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:4000   # → Render API URL in production
```

> 🔐 Never commit real secrets. `.env`, `.env.production`, and `.env.*` are git-ignored.

---

## 📜 Project Scripts

Run from the repo root:

| Script | Description |
| --- | --- |
| `npm run dev` | Start all apps (api + web + seller + admin) |
| `npm run build` | Build every app via Turborepo |
| `npm run lint` | Lint every app |
| `npm run dev:api` / `:web` / `:seller` / `:admin` | Start a single app |
| `npx turbo run build --filter=<app>` | Build one app (used by Render/Vercel) |

Inside `apps/api`:

| Script | Description |
| --- | --- |
| `npx prisma migrate dev` | Create & apply a Postgres migration |
| `npx prisma generate` | Regenerate the Prisma client |
| `npm run seed` | Seed demo catalog & users |

---

## ☁️ Deployment

HamroPasal runs entirely on **free tiers**:

| Component | Host | Notes |
| --- | --- | --- |
| API | **Render** | Build: `npm install --include=dev && npx turbo run build --filter=api`. Free instance sleeps after ~15 min idle (cold start ~30–50s). |
| Web / Seller / Admin | **Vercel** | One Vercel project per app (set the **Root Directory** to `apps/web`, `apps/seller`, `apps/admin`). |
| PostgreSQL | **Neon** | Set `DATABASE_URL` (pooled) + `DIRECT_URL`. |
| MongoDB | **MongoDB Atlas** | Allow access from anywhere (`0.0.0.0/0`) since Render has no static IP. |
| Redis | **Redis Cloud** | Set eviction policy to `noeviction` (it stores sessions/OTPs/jobs). |

**Production checklist**

- On Render, set `CLIENT_URL`, `SELLER_URL`, `ADMIN_URL` to the **exact** Vercel URLs (no trailing slash) — these drive both CORS **and** audience-scoped auth.
- Set each Vercel app's `NEXT_PUBLIC_API_URL` to the Render API URL.
- Add the production `GOOGLE_CALLBACK_URL` as an authorized redirect URI in the Google Cloud console.
- Cookies are issued `SameSite=None; Secure` in production for cross-site (Render ↔ Vercel) auth.

---

## 🗺️ Roadmap

### ✅ Shipped
- [x] Audience-scoped authentication (web / seller / admin isolation) + Google OAuth + email OTP
- [x] Multi-vendor catalog with option-based product variants
- [x] Multi-store cart, checkout, and order → sub-order splitting
- [x] eSewa / Khalti / COD payments, commission & seller payouts
- [x] Loyalty points & multi-level coupons
- [x] Reviews, product Q&A, and real-time customer↔seller chat
- [x] Seller dashboard & admin panel
- [x] Web-push + in-app notifications, OpenAPI docs
- [x] Mobile-optimized storefront
- [x] Free-tier deployment (Render + Vercel + Neon + Atlas + Redis Cloud)

### 🔜 Planned / ideas for future updates
- [ ] **Stripe / international payments** — finish the scaffolded Stripe flow for non-NPR cards
- [ ] **Full-text & faceted search** — Meilisearch / Algolia with filters & typo tolerance
- [ ] **Seller analytics 2.0** — revenue trends, best-sellers, conversion funnels
- [ ] **Order tracking & logistics** — courier integration and live delivery status
- [ ] **Recommendations** — "you may also like" / personalized home feed
- [ ] **Reviews with media moderation** — admin review queue for images
- [ ] **Multi-language (English / नेपाली)** and multi-currency display
- [ ] **PWA / offline support** and installable mobile app
- [ ] **Automated tests & CI** — unit + e2e (Playwright) with GitHub Actions
- [ ] **Observability** — structured logging, error tracking (Sentry), uptime monitoring

> 💡 *This roadmap is a living document — items will be added, reprioritized, or shipped over time.*

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

<div align="center">

Built with ❤️ for Nepal · **HamroPasal**

</div>
