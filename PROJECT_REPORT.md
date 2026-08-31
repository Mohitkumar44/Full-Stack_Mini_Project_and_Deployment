# Project Report — SpendWise

## 1. Project Title

**SpendWise — Student Expense Tracker**

## 2. Problem Statement

Students often struggle to track their daily expenses and stay within budget. Without a clear picture of where money goes, overspending becomes common. Existing expense apps are either too complex or not tailored to a student's needs. There is a need for a simple, focused tool that lets a student record expenses, categorize them, set monthly budgets, and visualize spending patterns.

## 3. Objective

Build a full-stack web application that allows students to:
- Register and log in securely
- Add, edit, delete, and view their expenses
- Search, filter, and sort expenses
- Set monthly budgets and track remaining balance
- View spending analytics on a dashboard
- Manage their profile

Every user's data must be private and isolated — no user can access another user's records.

## 4. Features

- Email/password authentication (sign up, sign in, sign out)
- Protected routes — unauthenticated users are redirected to login
- Expense CRUD with validation (title, amount > 0, category, date required)
- Search by title, description, or category
- Filter by category, payment method, and date range
- Sort by newest, oldest, highest, or lowest amount
- Dashboard with total spending, budget, remaining, and transaction count
- Spending-by-category donut chart
- 6-month spending bar chart
- Budget progress bar with over-budget warning
- Recent transactions list
- Budget management (set, edit, delete monthly budgets)
- Profile editing (name, email)
- Dark mode with system preference
- Responsive design (desktop sidebar, mobile drawer)
- Empty states, loading skeletons, and delete confirmations

## 5. Technology Used

- **Frontend**: Next.js 13 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui, Lucide icons, Recharts
- **Backend**: Next.js Route Handlers (REST API, TypeScript)
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth (email/password)
- **Deployment**: Netlify

## 6. System Architecture

```
Browser (React Client)
      ↓ fetch /api/*
Next.js Route Handlers (REST API)
      ↓ supabaseAdmin (service role, server-only)
PostgreSQL (Supabase) with Row Level Security
```

The client never talks to the database directly for mutations. All data operations go through API routes that verify the user's JWT, derive the user ID server-side, and scope every query to that user. RLS provides a database-level safety net.

## 7. Database Design

Three tables:

- **profiles** — extends `auth.users` with `full_name` and `email`. One row per user.
- **expenses** — stores individual expense records. `user_id` defaults to `auth.uid()` so inserts are automatically owner-scoped. Indexed on `user_id` and `expense_date` for fast queries.
- **budgets** — stores monthly budget limits. Unique constraint on `(user_id, month, year)` prevents duplicates.

All tables have RLS enabled with four ownership-scoped policies (SELECT, INSERT, UPDATE, DELETE), each checking `auth.uid() = user_id`.

## 8. API Design

RESTful endpoints under `/api/*`:
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`
- `GET/POST /api/expenses`, `GET/PUT/DELETE /api/expenses/:id`
- `GET/POST /api/budgets`, `PUT/DELETE /api/budgets/:id`
- `GET/PUT /api/profile`
- `GET /api/dashboard/stats`

All responses use `{ success, data }` or `{ success, message }`. HTTP status codes: 200, 201, 400, 401, 404, 500.

## 9. Authentication

Supabase Auth manages user accounts and sessions. Passwords are hashed by Supabase — never stored in application tables. The client-side `AuthContext` subscribes to `onAuthStateChange`, loads the user's profile, and gates all protected routes. The server verifies the JWT on every API call via `supabaseAdmin.auth.getUser(token)`.

## 10. CRUD Implementation

**Expenses**: Create via POST (validated server-side), read via GET (with search/filter/sort query params), update via PUT (partial updates), delete via DELETE (with ownership check). The UI updates immediately after each operation and shows a toast.

**Budgets**: Create/upsert via POST (unique per month/year), update via PUT, delete via DELETE.

## 11. Security

- JWT verified server-side on every request; user ID derived from the token, never from the client.
- Row Level Security on all tables — database enforces ownership even if the API has a bug.
- Service role key is server-only; never exposed to the browser.
- Input validation on all create/update endpoints.
- Delete confirmation dialogs for destructive actions.
- No secrets in LocalStorage or client-side code.

## 12. Challenges

- Ensuring the `onAuthStateChange` callback doesn't deadlock by wrapping async work in an IIFE.
- Designing RLS policies that work with `DEFAULT auth.uid()` so client inserts omitting `user_id` still pass the `WITH CHECK` predicate.
- Making the expense table usable on mobile without horizontal scroll while keeping all columns accessible.

## 13. Future Improvements

- Recurring expense templates
- Export expenses to CSV/PDF
- Multi-currency support
- Budget alerts via email
- Category-level sub-budgets
- Spending goals and savings tracking

## 14. Conclusion

SpendWise is a complete, production-quality full-stack application that demonstrates real REST API design, PostgreSQL database management, secure authentication, per-user data isolation via Row Level Security, and a responsive, professional UI. It fulfills all requirements of Internship Task 4 and is ready for deployment.
