# ECommence

A full-stack e-commerce platform for selling tech products — laptops, tablets, mobile phones, and smart watches. The storefront brand is **Deci Techno**, featuring a customer-facing shopping experience and an admin dashboard for managing products, users, orders, and analytics.

## Features

- **Customer Portal**: Product browsing, search & filter, cart management, checkout (Cash or Visa), order tracking, product reviews
- **Admin Dashboard**: Revenue analytics, product CRUD with image uploads, order management, user management, activity logs
- **Dual Database**: PostgreSQL for core entities (users, products, cart, orders) and MongoDB for reviews and activity logs
- **Role-Based Access**: ADMIN and CUSTOMER roles with JWT authentication
- **Docker Support**: Full Docker Compose setup with PostgreSQL, MongoDB, backend, and frontend services

## Technologies Used

| Category | Technology |
|----------|-----------|
| Runtime | Node.js 20 |
| Backend | Express + TypeScript |
| Frontend | React 19 + TypeScript + Vite |
| Primary Database | PostgreSQL 16 (via Prisma ORM) |
| Secondary Database | MongoDB 7 (via Mongoose) |
| Authentication | JWT + bcryptjs |
| State Management | TanStack React Query |
| HTTP Client | Axios |
| File Uploads | Multer |
| Email | Nodemailer |
| Styling | Custom CSS with CSS custom properties |
| Backend Testing | Jest + Supertest |
| Frontend Testing | Vitest + Testing Library + MSW |
| Production Server | Nginx (reverse proxy + SPA) |
| Containerization | Docker Compose |

## Project Structure

```
ecommence/
├── client/                 # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── api.ts          # Axios client & API functions
│   │   ├── context/        # Auth context
│   │   ├── hooks/          # React Query hooks
│   │   ├── components/     # Shared UI components
│   │   └── pages/          # Customer & admin pages
│   ├── Dockerfile
│   └── nginx.conf
├── server/                 # Express + TypeScript backend
│   ├── src/
│   │   ├── config/         # Database connections
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/      # Auth, uploads, logging
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routes
│   │   └── utils/          # Auth, email, validation
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Seed data
│   ├── Dockerfile
│   └── .env
├── docker-compose.yml
└── package.json            # Monorepo workspace root
```

## Setup Instructions

### Prerequisites

- Node.js 20+
- PostgreSQL 16
- MongoDB 7
- npm

### Local Development

1. **Clone the repository**
   ```bash
   git clone <...>
   cd ecommence
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy the example files and fill in your values:
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

4. **Set up the database**
   ```bash
   cd server
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

   This runs both the backend (port 5000) and frontend (port 5173) concurrently.

### Docker Setup

1. **Start all services**
   ```bash
   docker-compose up -d
   ```

2. **Run database migrations and seed**
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   docker-compose exec backend npx prisma db seed
   ```

3. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

## Project URLs

| Service | Local Development | Docker |
|---------|------------------|--------|
| Frontend | `http://localhost:5173` | `http://localhost:3000` |
| Backend API | `http://localhost:5000/api` | `http://localhost:5000/api` |
| Health Check | `http://localhost:5000/api/health` | `http://localhost:5000/api/health` |
| PostgreSQL | `localhost:5432` | `localhost:5432` |
| MongoDB | `localhost:27017` | `localhost:27017` |

## Test Accounts

### Admin Account

| Field | Value |
|-------|-------|
| Email | `admin@ecommence.com` |
| Password | `password123` |
| Role | ADMIN |

Admin access provides the full dashboard: product management, order management, user management, revenue analytics, and activity logs.

### Customer Account

| Field | Value |
|-------|-------|
| Email | `customer@ecommence.com` |
| Password | `password123` |
| Role | CUSTOMER |

Customer access provides: product browsing, cart, checkout, order history, and product reviews.

> **Note:** These accounts are created automatically when running `npx prisma db seed`. The seed also populates the database with 40 sample products across 4 categories (Laptops, Tablets, Mobile, Smart Watches).

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (search, filter, pagination) |
| GET | `/api/products/:id` | Get product details |
| POST | `/api/products` | Create product (Admin) |
| PUT | `/api/products/:id` | Update product (Admin) |
| DELETE | `/api/products/:id` | Delete product (Admin) |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get cart |
| POST | `/api/cart` | Add item to cart |
| PUT | `/api/cart/:id` | Update cart item quantity |
| DELETE | `/api/cart/:id` | Remove item from cart |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order from cart |
| GET | `/api/orders` | Get user orders |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews/:productId` | Get reviews for product |
| POST | `/api/reviews` | Create review |
| DELETE | `/api/reviews/:id` | Delete review (own or Admin) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/orders` | List all orders |
| GET | `/api/admin/orders/:id` | Get order details |
| PATCH | `/api/admin/orders/:id/status` | Update order/payment status |
| GET | `/api/admin/activity-logs` | Activity logs (paginated) |
| DELETE | `/api/admin/users/:id` | Delete customer user |

## License
