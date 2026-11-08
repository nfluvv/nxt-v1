<h1 align="center">💎 Nxt v1</h1>

<p align="center">
A production-ready <b>OAuth</b> starter built with <b>Next.js 16</b>, <b>Auth.js v5</b>, <b>Prisma</b>, <b>PostgreSQL</b>, and <b>Feature-Sliced Design (FSD)</b>.
</p>

<p align="center">
<a href="https://nxtemplate.vercel.app"><b>🚀 Live Demo</b></a>
</p>

---

> [!NOTE]
> This is more than a basic login template. It is a strong base for fast product work, with a focus on security and clean modules. Password login is removed on purpose, so the app uses only safe, modern OAuth.

> [!IMPORTANT]
> The project uses **Feature-Sliced Design (FSD)**. Layer boundaries are checked with **ESLint**, so there is no spaghetti code and features stay independent.

---

## 👾 Features

<table>
  <thead>
    <tr>
      <th width="280" align="left">Feature</th>
      <th align="left">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td width="280"><b>OAuth Authentication</b></td>
      <td>Google and GitHub login, ready out of the box.</td>
    </tr>
    <tr>
      <td width="280"><b>FSD Architecture</b></td>
      <td>Strict layer rules enforced with ESLint.</td>
    </tr>
    <tr>
      <td width="280"><b>Admin Panel</b></td>
      <td>Server-side user management, cursor pagination, search, roles, and audit log.</td>
    </tr>
    <tr>
      <td width="280"><b>Rate Limiting</b></td>
      <td>Token-bucket limits stored in PostgreSQL. Protects from brute-force and DDoS. No Redis needed.</td>
    </tr>
    <tr>
      <td width="280"><b>Account Linking</b></td>
      <td>Safe OAuth account merging with protection from account takeover.</td>
    </tr>
    <tr>
      <td width="280"><b>Profile Management</b></td>
      <td>Change username, display name, email, and password. Sessions are saved.</td>
    </tr>
    <tr>
      <td width="280"><b>Cloudinary Uploads</b></td>
      <td>Signed avatar uploads from the client.</td>
    </tr>
    <tr>
      <td width="280"><b>Language Switching</b></td>
      <td>English and Russian.</td>
    </tr>
    <tr>
      <td width="280"><b>Responsive UI</b></td>
      <td>Smooth layout built with React 19, Tailwind CSS 4, and shadcn/ui.</td>
    </tr>
    <tr>
      <td width="280"><b>Themes</b></td>
      <td>Dark, light, and system theme. The choice is saved.</td>
    </tr>
  </tbody>
</table>

---

## 🔥 Tech Stack

<table>
  <thead>
    <tr>
      <th width="220" align="left">Area</th>
      <th align="left">Tools</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td width="220"><b>Framework</b></td>
      <td>Next.js 16 (App Router)</td>
    </tr>
    <tr>
      <td width="220"><b>UI</b></td>
      <td>React 19</td>
    </tr>
    <tr>
      <td width="220"><b>Authentication</b></td>
      <td>Auth.js / NextAuth.js v5</td>
    </tr>
    <tr>
      <td width="220"><b>Database & ORM</b></td>
      <td>PostgreSQL, Prisma</td>
    </tr>
    <tr>
      <td width="220"><b>State</b></td>
      <td>Zustand (client), TanStack Query v5 (server)</td>
    </tr>
    <tr>
      <td width="220"><b>Forms</b></td>
      <td>React Hook Form + Zod</td>
    </tr>
    <tr>
      <td width="220"><b>UI Components</b></td>
      <td>shadcn/ui + Radix UI</td>
    </tr>
    <tr>
      <td width="220"><b>Styling</b></td>
      <td>Tailwind CSS 4</td>
    </tr>
    <tr>
      <td width="220"><b>Services</b></td>
      <td>Cloudinary (images), Resend (email)</td>
    </tr>
    <tr>
      <td width="220"><b>Testing & CI</b></td>
      <td>Vitest, GitHub Actions</td>
    </tr>
  </tbody>
</table>

---

## 🚀 Installation

<details>
<summary><b>Step-by-step guide</b></summary>

<br>

**1. Clone the repository**

```bash
git clone https://github.com/nfluvv/nxt-v1.git
cd nxt-v1
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

```bash
cp .env.example .env
```

Fill in the values in `.env`: database connection string, Auth.js secret, Google and GitHub client IDs, and Resend and Cloudinary keys.

**4. Set up the database**

Make sure PostgreSQL is running, then run:

```bash
npx prisma generate
npx prisma migrate dev
```

**5. Start the dev server**

```bash
npm run dev
```

Open the app at `http://localhost:3000`.

</details>

<details>
<summary><b>Useful Prisma commands</b></summary>

<br>

```bash
# Generate Prisma Client
npx prisma generate

# Create and apply a new migration
npx prisma migrate dev

# Apply migrations in production
npx prisma migrate deploy

# Open Prisma Studio (database viewer)
npx prisma studio

# Reset the database
npx prisma migrate reset
```

> [!WARNING]
> `prisma migrate reset` deletes all tables and data. Never run it in staging or production.

</details>

---

## 🏗 Architecture

> [!TIP]
> Each layer can only import from the layers below it. This avoids cyclic dependencies and keeps the code easy to scale.

<details>
<summary><b>Project structure</b></summary>

<br>

```text
src/
├── app/          # Global layout, providers, styles, and config
├── views/        # Page-level compositions
├── widgets/      # Large UI blocks that combine features and entities
├── features/     # User actions, forms, and business logic
├── entities/     # Domain models, Prisma queries, schemas, and stores
├── shared/       # UI kit, utilities, and network clients
└── auth.ts       # Core Auth.js provider configuration

app/              # Next.js routing layer (no business logic here)
```

</details>

---

## 💰 License

Released under the **Apache 2.0 License** by nfluvv. The full text is in the repository.
