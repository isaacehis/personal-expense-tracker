# Software Requirements Specification

## 1. Purpose and scope

ExpenseTrack lets registered individuals record personal income and expenses, plan monthly expense-category budgets, and review real financial trends. It excludes bank integration, payment processing, shared household accounts, public profiles, and financial advice.

## 2. Users and assumptions

- Visitor: may view the landing page, FAQs, privacy notice, login, and registration.
- Authenticated user: may access only their own categories, transactions, budgets, profile, and sessions.
- Deployment administrator: manages infrastructure and migrations but must not use application screens to inspect user records.
- The system assumes a modern browser, JavaScript, HTTPS in production, and a reachable PostgreSQL database.

## 3. Functional requirements

| ID | Requirement | Acceptance condition |
|---|---|---|
| FR-01 | Register and authenticate | Valid registration creates default categories and a hashed database session; invalid input is rejected. |
| FR-02 | Protect private routes | Unauthenticated access redirects to login or returns HTTP 401 for APIs. |
| FR-03 | Manage transactions | User can create, list, search, filter, paginate, edit, and delete owned income/expense records. |
| FR-04 | Enforce ownership | A resource ID owned by another user behaves as not found and is never changed. |
| FR-05 | Manage budgets | User can create, edit, and delete one monthly budget per expense category. |
| FR-06 | Calculate actual spending | Budget actuals equal owned EXPENSE transactions in the selected calendar month/category. |
| FR-07 | Show dashboard | Current income, expenses, balance, charts, budget progress, and recent records use PostgreSQL data. |
| FR-08 | Show analytics | Six-month income-versus-expense and current expense-category views use real records. |
| FR-09 | Manage settings | User can change name, unique email, currency, timezone, and verified password. |
| FR-10 | Revoke sessions | Successful password change revokes all sessions except the current one. |
| FR-11 | Provide system states | Forms and data views show loading, error, success, and empty states. |
| FR-12 | Provide public discovery | Accurate titles/descriptions, favicon, social image, robots, sitemap, Search Console token, privacy, and optional analytics are available. |

## 4. Non-functional requirements

- Security: server authentication/authorization, Argon2id, hashed tokens, HttpOnly Secure production cookies, same-origin checks, JSON validation, rate limits, parameterized Prisma queries, RLS, security headers, and no secret returned to clients.
- Reliability: relational constraints, atomic registration/password operations, deterministic calculations, consistent API errors, and production build checks.
- Scalability: pooled PostgreSQL adapter, stateless Next.js instances backed by shared database sessions and rate limits, indexed ownership/date fields, pagination capped at 50.
- Usability: responsive mobile/tablet/desktop layout, dark mode, clear navigation, breadcrumbs, keyboard focus, form labels, and readable feedback.
- Maintainability: typed modules, small validation/calculation helpers, migrations, automated tests, documentation, and meaningful Git commits.
- Privacy: minimum account/finance data, no banking credentials, no fabricated reviews/profile links, and deployment-specific analytics control.

## 5. Constraints and success criteria

The solution uses the specified stack and preserves existing history. A release is acceptable when Prisma validation/generation, TypeScript, ESLint, unit tests, API smoke tests, and `next build` pass; no `.env`, `.next`, `node_modules`, or `.git` data appears in the submission archive.
