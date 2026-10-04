# 💎 Nxtemplate — OAuth Starter

A battle-tested, high-performance authentication ecosystem built with **Next.js 16 (App Router)**, **Auth.js v5**, **Prisma ORM**, **PostgreSQL**, and structured around **Feature-Sliced Design (FSD)**.

This is not just another basic login boilerplate. It is an enterprise-grade foundation engineered for security, modularity, and rapid product delivery. Credentials logic has been stripped out to enforce secure, modern OAuth workflows, combined with a hardened security stack.

**[🚀 Live Demo](https://nxtemplate.vercel.app)**

---

### 👾 Engineered Features

- **Pure OAuth Authentication** — Seamless integration with Google and GitHub providers out of the box.
- **Robust FSD Architecture** — Strict layer boundaries enforced via ESLint, ensuring zero spaghetti code and decoupling feature components.
- **Enterprise-Grade Admin Panel** — Built-in server-side user management, fast cursor pagination, structural search, role management, and immutable audit logging.
- **Infrastructure-Free Rate Limiting** — PostgreSQL-backed token-bucket rate limiting to mitigate brute-force and DDoS vectors without Redis dependencies.
- **Bulletproof Account Linking** — Secure OAuth account merging mechanisms completely hardened against sophisticated account-takeover scenarios.
- **Advanced Profile Management** — Dynamic username/display name modification, dynamic email routing, password control, and persistent sessions.
- **Signed Cloudinary Uploads** — Secure, client-side verified avatar uploads utilizing signed cryptographic tokens.
- **Dual-Layer Language Switching** — Native internationalization architecture support (English + Русский).
- **Responsive UI Evolution** — Premium fluid layout crafted with React 19, Tailwind CSS 4, and fully customizable shadcn/ui components.
- **Persistent Theme System** — Synchronized Dark, Light, and System theme persistence.

---

### 🔥 Technical Stack

- **Framework:** Next.js 16 (App Router)
- **UI Runtime:** React 19
- **Security & Auth:** Auth.js / NextAuth.js v5
- **Database Engine:** PostgreSQL
- **Data Modeling:** Prisma ORM
- **Client State:** Zustand
- **Server State:** TanStack Query v5 (React Query)
- **Validation Engine:** React Hook Form + Zod validation schemas
- **Primitives Kit:** shadcn/ui + Radix UI Primitives
- **Styling Architecture:** Tailwind CSS 4 (Next-gen compiler)
- **Media Asset Storage:** Cloudinary CDN
- **Transactional Mailer:** Resend API
- **Test Automation:** Vitest environment
- **CI/CD Pipeline:** GitHub Actions automation workflow

---

### 🚀 Production Installation

#### 1. Clone the Architecture
```bash
git clone https://github.com/nfluvv/nxt-v1.git
cd nxt-v1
```

#### 2. Bootstrap Package Workspace
```bash
npm install
```

#### 3. Establish Cryptographic & Environment Environment
Generate your production configuration file:
```bash
cp .env.example .env
```
Open `.env` and fill the variables: database connection pool string, Auth.js deployment secret, Google/GitHub client IDs, and your active Resend/Cloudinary API endpoints.

#### 4. Sync Database Schema & Primitives
Ensure your PostgreSQL instance is running, then execute:
```bash
# Generate type-safe Prisma Client models
npx prisma generate

# Create and execute the development database migration
npx prisma migrate dev
```

To visually inspect database entries, manage audit logs, or alter user roles manually, boot up the native schema GUI:
```bash
npx prisma studio
```

#### 5. Spin Up Runtime Engine
```bash
npm run dev
```
The boilerplate engine boots up instantly at: `http://localhost:3000`

---

### 🛠 Operational Prisma Toolchain

```bash
# Force regeneration of type-safe Prisma schemas
npx prisma generate

# Generate localized migration files and update local DB
npx prisma migrate dev

# Execute production migrations down the deployment pipeline
npx prisma migrate deploy

# Fire up visual database management dashboard
npx prisma studio

# Destructive command: Wipes database clean and applies migrations from scratch
npx prisma migrate reset
```
> ⚠️ **Warning:** Running `npx prisma migrate reset` drops all existing tables and truncates data instantly. Never trigger this in staging or production environments.

---

### 🏗 Architecture & Codebase Topology

The code relies tightly on the **Feature-Sliced Design (FSD)** methodology, eliminating cyclic dependencies and global coupling.

```text
src/
├── app/          # Global application layout, providers, styles, and configurations
├── views/        # Structural page-level compositions and main screen layers
├── widgets/      # High-level compound UI blocks combining features and entities
├── features/     # Isolated user actions, forms, mutations, and business-focused interactions
├── entities/     # Decoupled domain models, Prisma queries, validation schemas, and stores
├── shared/       # Reusable abstraction layer: UI Kit, utility functions, and network drivers
└── auth.ts       # Core cryptographic Auth.js authentication provider runtime configuration

app/              # Next.js physical file-system routing layer (Zero business logic here)
```

---

### 💰 Core License

- Open-source software deployed under the **Apache 2.0 License** by nfluvv. Full legal compliance text is verified in the repository tree.
