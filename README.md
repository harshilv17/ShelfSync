# ShelfSync - Distributed Library Management System

ShelfSync is a **Distributed Multi-Branch Library Management System** backend built with a strict **Domain-Driven Design (DDD)** architecture.
It handles multiple library branches with distributed locks for real-time consistency, event-buses for asynchronous processes, and role-based access for different users.

## 🚀 Tech Stack

| Tool | Purpose |
|------|---------|
| **Node.js + Express + TypeScript** | Framework |
| **PostgreSQL (via Neon) + Prisma ORM** | Database |
| **Redis (via ioredis)** | Distributed Locking |
| **Zod** | Validation |
| **JWT (JSON Web Tokens)** | Auth |

**Patterns Used**: Repository Pattern, Optimistic Concurrency Control, Event Bus, Domain-Driven Design

## 🏗 Architecture

The system enforces a strict layered architecture:

| Layer | Path | Responsibility |
|-------|------|----------------|
| **Domain Layer** | `src/domain/` | Pure entities (`Book`, `Loan`, `User`, etc.), value objects (`Money`), custom domain errors, and interfaces for Repositories and Lock Managers. Has **zero** dependencies on the rest of the application or the framework. |
| **Application Layer** | `src/application/` | Use-case services (`BorrowBookService`, `ReturnBookService`, `ReservationService`) orchestrating domain entities and resolving business flows. |
| **Infrastructure Layer** | `src/infrastructure/` | Prisma implementations for the Repositories, In-Process Event Bus, and Redis Lock Manager to safely prevent dirty reads/writes across multiple servers. |
| **API / Presentation Layer** | `src/api/` | Express routes, Zod schemas, and JWT Authentication middleware parsing the incoming IO. |

## 📝 Key Features

1. **Borrowing**: Strict availability and concurrency checks via Redis Locks to ensure a book is not multi-borrowed simultaneously.
2. **Returning**: Fine calculation Strategy logic applied when resolving a returned loan. Generates local `BookReturned` domain events.
3. **Reservations**: Queue tracking logic tied asynchronously to the Event Bus to inform and fulfill a reservation as soon as a book becomes available.

## ⚙️ Start Development

### 1. Configure the Environment

Ensure your `.env` contains:

```env
DATABASE_URL="postgres://username:password@your-neon-host/db_name?sslmode=require"
JWT_SECRET="your_secure_jwt_secret"
JWT_EXPIRES_IN="24h"
REDIS_URL="redis://localhost:6379"
```

### 2. Setup Database & Start Server

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Build the TypeScript project
npx tsc

# Start the application
npm run start

# Alternatively, run in dev via TS Node
npx ts-node src/server.ts
```

## 🔒 Automated Guardrails

- **Optimistic Locking**: Every `Book` and `Loan` increment a Prisma `@version` integer upon update. Concurrent writes throwing conflicts are handled gracefully.
- **Role-Based Access Control**: Standard Express checks exist preventing non-librarian users from performing sensitive operations.
