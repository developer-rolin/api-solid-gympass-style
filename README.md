# App

GymPass style app.

## Functional Requirements

* \[x\] Users must be able to register;
* \[x\] Users must be able to authenticate;
* \[x\] Users must be able to get their logged-in profile;
* \[x\] Users must be able to get the number of check-ins performed;
* \[x\] Users must be able to get their check-in history;
* \[x\] Users must be able to search for nearby gyms (up to 10km);
* \[x\] Users must be able to search gyms by name;
* \[x\] Users must be able to check-in at a gym;
* \[x\] Check-ins must be validated;
* \[x\] Gyms must be able to be registered;

## Business Rules

* \[x\] Users cannot register with a duplicate email;
* \[x\] Users cannot make 2 check-ins on the same day;
* \[x\] Users cannot check-in if they are not close (100m) to the gym;
* \[x\] Check-ins can only be validated up to 20 minutes after creation;
* \[x\] Check-ins can only be validated by administrators;
* \[x\] Gyms can only be registered by administrators;

## Non-Functional Requirements

* \[x\] User passwords must be encrypted;
* \[x\] Application data must be persisted in a PostgreSQL database;
* \[x\] All data lists must be paginated with 20 items per page;
* \[x\] Users must be identified by a JWT (JSON Web Token);

## 🛠️ Tech Stack & Tools

### Core & Runtime
* [**Node.js**](https://nodejs.org/) (v20+) & [**TypeScript**](https://www.typescriptlang.org/)
* [**Fastify**](https://www.fastify.io/) - Blazing fast and low overhead web framework
* [**Zod**](https://zod.dev/) - Schema validation and static type inference
* [**Prisma ORM**](https://www.prisma.io/) - Next-generation ORM for database mapping
* [**PostgreSQL**](https://www.postgresql.org/) - Relational database (via Docker)

### Authentication & Security
* [**Fastify JWT**](https://github.com/fastify/fastify-jwt) - JSON Web Token authentication
* [**Fastify Cookie**](https://github.com/fastify/fastify-cookie) - Secure HTTP-only Cookie handling for Refresh Tokens
* [**BcryptJS**](https://github.com/dcodeIO/bcrypt.js) - Secure password hashing

### Testing & Quality
* [**Vitest**](https://vitest.dev/) - Blazing fast test runner
* [**Supertest**](https://github.com/ladjs/supertest) - HTTP assertions for E2E testing
* [**ESLint**](https://eslint.org/) - Code linting and static analysis
* [**GitHub Actions**](https://github.com/features/actions) - CI/CD pipeline automation

---

## 📐 System Architecture

The application was designed keeping **Business Rules completely decoupled from the Infrastructure and Frameworks layers**.

```text
src/
├── @types/            # Global type extensions (Fastify / JWT)
├── env/               # Environment variables validation and export with Zod
├── http/              # Presentation / HTTP Layer
│   ├── controllers/   # HTTP handlers organized by domain (users, gyms, check-ins)
│   ├── middlewares/   # JWT authentication and Role-Based Access Control (RBAC)
│   └── routes.ts      # Fastify central routes registry
├── lib/               # Global clients and instances (Prisma Client)
├── repositories/      # Data Access Layer
│   ├── in-memory/     # In-memory implementations for unit tests
│   └── prisma/        # Real implementations using Prisma ORM
├── use-cases/         # Application / Business Logic Layer (Domain Layer)
│   ├── errors/        # Custom domain exceptions
│   └── factories/     # Factory Design Pattern for Dependency Injection
└── utils/             # Helpers and utilities (Haversine distance calculation, test helpers)
```

### 🔒 Authentication, Refresh Token & Access Control (JWT & RBAC)

The API security implements modern strategies for route protection and session management:

* **Token Validation (JWT & Bearer):**
  * The `verify-jwt.ts` middleware intercepts protected routes validating the JWT token sent in the authorization header.
  * The decoded payload is injected into `request.user`, allowing identification of the user ID and role.

* **Session Renewal via HttpOnly Cookie (Refresh Token):**
  * Globally configured via `@fastify/jwt` and `@fastify/cookie` in `app.ts` to manage a cookie named `refreshToken`.
  * On the refresh route, `await request.jwtVerify({ onlyCookie: true })` ignores common headers and exclusively targets the secure cookie, validating session continuity without exposing credentials to malicious scripts (XSS prevention).

* **Role-Based Access Control / RBAC (`verifyUserRole`):**
  * Implemented through a Higher-Order Function (HOF) in `verify-user-role.ts`, restricting sensitive actions (such as gym creation or check-in validation) strictly to users with the `ADMIN` role.

🔄 **Data Flow (Step-by-Step)**
To ensure readability, maintainability, and testing ease, each request follows a strict responsibility flow:

```text
[HTTP Client]
      │
      ▼
1. [HTTP Route + Middleware]  ─── (Validates JWT/Cookie and RBAC Role Authorization)
      │
      ▼
2. [Controller]               ─── (Validates request inputs via Zod)
      │
      ▼
3. [Factory]                  ─── (Instantiates Use Case + Injects Prisma Repository)
      │
      ▼
4. [Use Case]                 ─── (Executes pure business rules, e.g., max 100m distance)
      │
      ▼
5. [Repository]               ─── (Communicates with PostgreSQL via Prisma ORM)
```

**The role of the Factory Pattern**
Inside `src/use-cases/factories/`, factory functions centralize the instantiation of real repositories and dependency injection into Use Cases, keeping Controllers free from managing service initialization.

🧪 **TDD Methodology & Testing Strategy**
The project was structured from the ground up following TDD (Test-Driven Development) principles, ensuring high cohesion, low coupling, and robust business logic before writing HTTP controllers.

1. **Unit Tests (`npm run test`)**
   * **Focus:** Validate pure business rules inside Use Cases in complete isolation.
   * **In-Memory Repositories:** Use of in-memory implementations (`src/repositories/in-memory/`) matching real repository contracts. This allows unit tests to run in milliseconds without databases or external I/O dependency.

2. **End-to-End Tests (`npm run test:e2e`) & Vitest Custom Environment**
   * To test the complete application lifecycle (Routes, Middlewares, Controllers, HTTP Status, Cookies, and Real Database) in parallel without state collisions, a Custom Vitest Environment was developed (`prisma/vitest-environment-prisma/prisma-test-environment.ts`).
   * **How it works:**
     * **Schema per Test File:** Before each E2E suite runs, the environment generates a unique schema name using a UUID.
     * **Dynamic URL Injection:** Prisma's `DATABASE_URL` is dynamically rewritten at runtime to point to the isolated schema in PostgreSQL.
     * **Migration Deploy:** Applies database migrations automatically and swiftly via `npx prisma migrate deploy`.
     * **Tear Down:** Once tests finish execution, a `DROP SCHEMA ... CASCADE` command drops the schema to keep the environment clean.

⚡ **How to Run the Project Locally**

### Prerequisites
* Node.js v20+
* Docker and Docker Compose

### 1. Clone and Install Dependencies
```bash
git clone git@github.com:developer-rolin/api-solid-gympass-style.git
cd api_solid_solid_gympass
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory based on `.env.example`:
```env
NODE_ENV=dev
PORT=3333
DATABASE_URL="postgresql://docker:docker@localhost:5432/apisolid?schema=public"
JWT_SECRET="your-jwt-secret-key"
```

### 3. Spin Up the Database (Docker)
```bash
docker compose up -d
```

### 4. Run Database Migrations
```bash
npm run prisma:migrate:dev
```

### 5. Run the Application
```bash
# Development mode with live-reload
npm run start:dev

# Production build
npm run build

# Run production build
npm run start
```

📜 **Test & Quality Commands**
```bash
# Run unit tests (TDD / In-memory)
npm run test

# Run unit tests in watch mode
npm run test:watch

# Run End-to-End (E2E) tests with isolated database
npm run test:e2e

# Run E2E tests in watch mode
npm run test:e2e:watch

# Generate code coverage report
npm run test:coverage

# Run linter (ESLint)
npm run lint
```

⚙️ **Continuous Integration (CI/CD)**
The repository features automated pipelines via GitHub Actions (`.github/workflows/`). On every push or pull request:
1. An Ubuntu virtual machine with Node.js v20 is provisioned.
2. A PostgreSQL container boots up in the background.
3. Prisma migrations are applied automatically.
4. The entire unit and E2E test suite runs to prevent regressions.