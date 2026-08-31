# SpendWise — Student Expense Tracker

A full-stack expense tracking application built for students. Register, log in, record expenses, set monthly budgets, and visualize your spending — all with secure per-user data isolation.

## Features

- **Authentication** — Email/password sign up, sign in, sign out via Supabase Auth
- **Expense CRUD** — Create, read, update, and delete expenses with full validation
- **Search** — Search expenses by title, description, or category
- **Filters** — Filter by category, payment method, and date range (today, this week, this month, last month, custom)
- **Sorting** — Sort by newest, oldest, highest amount, or lowest amount
- **Dashboard Analytics** — Total spending, monthly budget, remaining balance, transaction count
- **Charts** — Spending-by-category donut chart and 6-month spending bar chart (real database data)
- **Budget Management** — Set monthly budgets with progress tracking and over-budget warnings
- **Recent Transactions** — Latest expenses with quick navigation
- **Profile Settings** — Edit full name and email
- **Dark Mode** — Light/dark theme with system preference, persisted
- **Responsive Design** — Sidebar on desktop, collapsible drawer on mobile, touch-friendly
- **Empty States** — Contextual empty states with CTA buttons throughout
- **Loading States** — Skeleton loaders and spinners for all async operations
- **Delete Confirmation** — Confirmation dialogs for all destructive actions
- **Currency** — Indian Rupee (₹) formatting with Indian number system

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 13 (App Router), React, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Icons | Lucide React |
| Charts | Recharts |
| Database | PostgreSQL (Supabase) |
| Authentication | Supabase Auth (email/password) |
| API | Next.js Route Handlers (REST) |
| Deployment | Netlify (Next.js) |

## Architecture

```
Browser (React UI)
      ↓
Next.js Route Handlers (REST API)
      ↓
Supabase Admin Client (server-side, service role)
      ↓
PostgreSQL Database (Supabase) + Row Level Security
```

The frontend talks to Next.js API routes (`/api/*`). Each route verifies the user's JWT via `supabaseAdmin.auth.getUser(token)`, then queries the database scoped to that user's ID. Row Level Security provides a second layer of defense: even if a query accidentally omits the user filter, the database itself rejects cross-user access.

## Authentication

- Uses Supabase Auth with email/password (no magic links, no social providers).
- Passwords are hashed by Supabase — never stored in plaintext or in application tables.
- Sessions are persisted via Supabase's secure session management (HTTP-only cookies).
- The client-side `AuthContext` listens to `onAuthStateChange` and protects all app routes.
- Unauthenticated users are redirected to `/login`.

## Database

### Tables

**profiles**
- `id` (uuid, PK, references `auth.users.id`)
- `full_name` (text)
- `email` (text)
- `created_at`, `updated_at` (timestamptz)

**expenses**
- `id` (uuid, PK)
- `user_id` (uuid, FK → `auth.users.id`, defaults to `auth.uid()`)
- `title` (text, required)
- `amount` (numeric(12,2), required, > 0)
- `category` (text, required)
- `description` (text)
- `payment_method` (text)
- `expense_date` (date, required)
- `created_at`, `updated_at` (timestamptz)

**budgets**
- `id` (uuid, PK)
- `user_id` (uuid, FK → `auth.users.id`, defaults to `auth.uid()`)
- `month` (integer, 1–12)
- `year` (integer)
- `amount` (numeric(12,2), ≥ 0)
- Unique constraint on `(user_id, month, year)`
- `created_at`, `updated_at` (timestamptz)

### Row Level Security

Every table has RLS enabled with four policies (SELECT, INSERT, UPDATE, DELETE), each scoped to `TO authenticated` with an `auth.uid() = user_id` ownership check. Users can only ever access their own rows.

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create a new account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | List expenses (supports search, filter, sort) |
| POST | `/api/expenses` | Create an expense |
| GET | `/api/expenses/:id` | Get a single expense |
| PUT | `/api/expenses/:id` | Update an expense |
| DELETE | `/api/expenses/:id` | Delete an expense |

### Budgets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budgets` | List budgets |
| POST | `/api/budgets` | Create/upsert a budget |
| PUT | `/api/budgets/:id` | Update a budget |
| DELETE | `/api/budgets/:id` | Delete a budget |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get current user's profile |
| PUT | `/api/profile` | Update profile |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get dashboard analytics |

All responses use a consistent JSON structure:
```json
{ "success": true, "data": ... }
{ "success": false, "message": "Error description" }
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_URL=
```

Only `NEXT_PUBLIC_*` variables are exposed to the browser. `SUPABASE_SERVICE_ROLE_KEY` is server-only and never reaches client code.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` — you'll be redirected to the login page.

## Deployment

The app is configured for Netlify with the `@netlify/plugin-nextjs` plugin (see `netlify.toml`). The Next.js API routes run as serverless functions alongside the frontend, so the entire app deploys as a single unit.

1. Push the repository to GitHub.
2. Connect the repo to Netlify.
3. Set the environment variables in the Netlify dashboard.
4. Deploy — the build command (`npx next build`) and publish directory (`.next`) are pre-configured.

## Security

- **Authentication**: Supabase Auth handles password hashing and session management.
- **Authorization**: Every API route verifies the JWT and derives the user ID server-side — client-supplied user IDs are never trusted.
- **Row Level Security**: Database-level enforcement ensures users can only access their own rows, even if the API layer has a bug.
- **Input Validation**: Server-side validation on all create/update endpoints (required fields, amount > 0, valid categories).
- **Secrets**: The service role key is server-only; no secrets appear in client-side code or LocalStorage.
- **User Data Isolation**: A logged-in user can never access another user's expenses or budgets.

## Internship Task 4 — Requirements Coverage

| Requirement | How it's met |
|------------|--------------|
| 1. Complete practical web application | Full-stack Next.js app with dashboard, expenses, budgets, and profile pages |
| 2. Backend REST API | Next.js Route Handlers under `/app/api/*` implementing RESTful CRUD |
| 3. Database | PostgreSQL on Supabase with `profiles`, `expenses`, `budgets` tables |
| 4. CRUD operations | Full create/read/update/delete for expenses and budgets |
| 5. Authentication / user-specific functionality | Supabase Auth + RLS policies isolating data per user |
| 6. Clean folder structure | Separated `app/`, `components/`, `lib/`, `hooks/` with single-responsibility modules |
| 7. Online deployment | Netlify-ready with `netlify.toml` and environment-based config |
| 8. GitHub-ready source code | `.gitignore` excludes secrets; no hardcoded credentials |
| 9. Project report | See `PROJECT_REPORT.md` |
