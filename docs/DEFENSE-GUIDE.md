# Supervisor Defense Questions and Answers

Use these as understanding prompts, not a script to memorize.

## Core design

**What problem does the project solve?**  
It replaces informal expense notes with a private ledger that calculates current totals, category budgets, and six-month trends consistently.

**Why Next.js App Router?**  
It keeps server-rendered private data, interactive client forms, route handlers, metadata, error/loading boundaries, and deployment in one typed project.

**Why PostgreSQL and Prisma?**  
Finance data is relational and needs uniqueness, foreign keys, decimal/check constraints, indexes, transactions, and RLS. Prisma supplies typed, parameterized access through the PostgreSQL driver adapter.

**Why not store money in JavaScript floating point?**  
PostgreSQL stores `Decimal(14,2)`. The server serializes amounts as two-decimal strings. Numeric conversion is used only for bounded display calculations and is rounded by tested helpers.

## Authentication and security

**What is authentication versus authorization?**  
Authentication proves who the user is; authorization checks whether that identified user owns the requested record. The application performs both on the server.

**How is a password stored?**  
Argon2id derives a salted, memory-hard hash. Login verifies that hash. Plain passwords are never written to the database or returned.

**How do sessions work?**  
The server creates a 256-bit random token, sends it only in an HttpOnly cookie, stores SHA-256(token) with expiry/revocation in PostgreSQL, and hashes the received cookie before lookup.

**How is CSRF reduced?**  
SameSite=Lax cookies limit cross-site sending and every state-changing handler verifies that Origin or Referer has the exact request origin.

**How is SQL injection prevented?**  
Zod validates input and Prisma parameters/tagged template substitutions keep values separate from SQL commands. The code never concatenates user input into a query.

**How is user isolation enforced?**  
Every query/write carries the authenticated `userId`, relation IDs are checked against the same user, updates/deletes use ID plus owner, and PostgreSQL RLS compares transaction-local user context. Tests prove user B cannot list/delete user A’s transaction.

**Is the system 100% secure?**  
No honest system can promise that. The project uses defense in depth and still requires secure deployment, backups, least privilege, monitoring, updates, and future professional review.

**Why is no public database key in the browser?**  
This is server-connected PostgreSQL, not a browser database SDK. The safer design is no frontend database credential at all; browser requests go through authorized Next.js handlers.

## Features and calculations

**How are monthly totals calculated?**  
A timezone determines the user’s current calendar month. The database query uses inclusive month start and exclusive next-month start, then separates INCOME and EXPENSE values.

**How is overspending detected?**  
Owned EXPENSE transactions are grouped by category within the budget month. Progress is `spent / budget × 100`; `spent > budget` sets the warning.

**Why six months?**  
It provides a useful short-term comparison without overwhelming the dashboard. A pure function creates six month buckets and aggregates each transaction type.

**Why pagination?**  
It bounds database and network work as transaction history grows. The API caps a page at 50 and the UI uses 10.

## Demonstration/debugging

**How would you add a new currency?**  
Add its ISO code to the Zod enum and settings options, test `Intl.NumberFormat`, then run unit/type/lint/build checks.

**How would you diagnose an empty dashboard?**  
Confirm session/user timezone, query the selected month, verify transaction dates/types/owner IDs, run database/API checks, and inspect server logs without exposing credentials.

**What would you improve next?**  
Email verification/recovery, MFA, recurring transactions, CSV export/import, audit history, account deletion UI, and formal usability/security testing.

## Files worth opening during defense

- `prisma/schema.prisma` and migrations: models, constraints, RLS
- `lib/auth/session.ts` and `password.ts`: token/password handling
- `lib/api.ts`: same-origin/content guards and error shape
- `app/api/transactions/[id]/route.ts`: ownership-safe update/delete
- `lib/finance.ts` and tests: understandable calculations
- `lib/finance-data.ts`: real dashboard mapping
- `app/(dashboard)/transactions/transaction-manager.tsx`: interactive UI states

Practice changing a validation limit, adding a category option, and explaining the resulting test/build cycle before the defense.
