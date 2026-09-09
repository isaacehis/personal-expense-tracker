# ExpenseTrack — Personal Expense Tracking System

ExpenseTrack is a submission-ready final-year Computer Science project for securely recording income and expenses, setting monthly category budgets, and analyzing personal financial trends. It is an extension of the original Git history—not a restarted scaffold—and all dashboard values come from PostgreSQL.

> Academic integrity: the project was developed with AI-assisted engineering. The included defense guide explains the design so the student can demonstrate, modify, and discuss it honestly. No claim is made that the work was completed without assistance.

## Main features

- Secure registration, login, logout, password recovery, current-user lookup, and database sessions
- Argon2id password hashes, SHA-256 session-token hashes, and HttpOnly cookies
- Multi-user transaction CRUD with search, type/category/date/month filters, and pagination
- Monthly category budget CRUD with actual spending and overspending warnings
- Dashboard totals, six-month income/expense chart, category analysis, budgets, and recent activity
- Profile, unique email, currency, timezone, and verified password updates
- Revocation of other sessions after a password change
- Same-origin and JSON checks, database-backed rate limiting, per-user authorization, and PostgreSQL RLS
- Responsive light/dark UI, keyboard focus, labels, loading/error/empty states, breadcrumbs, custom 404, and mobile CTA
- Landing-page CTA, accurate FAQs, privacy policy, favicon, Open Graph image, metadata, robots, sitemap, optional Google Analytics, and Search Console verification
- Unit tests plus a production-server API isolation smoke test

Local-business maps, directions, customer reviews, LocalBusiness schema, inquiry pages, and social-profile icons are intentionally absent: this is a private finance web application, not a local business, and adding invented locations, reviews, or profiles would be misleading.

## Technology

- Next.js 16.3 App Router, React 19, TypeScript, Tailwind CSS 4
- PostgreSQL, Prisma ORM 7.10, `@prisma/adapter-pg`
- Zod 4, Argon2id, Node.js test runner, ESLint, Git

## Quick start

Requirements: Node.js 20+ (LTS recommended), npm, PostgreSQL, and a separate empty shadow database for development migrations.

```bash
npm install
copy .env.example .env
npm run db:validate
npm run db:migrate:deploy
npm run db:generate
npm run dev
```

Edit `.env` with local credentials first. Never commit it. Open `http://localhost:3000`, create an account, and use the generated default categories.

Password-recovery email uses Resend. Configure `RESEND_API_KEY`, `PASSWORD_RESET_FROM`, and `PASSWORD_RESET_SECRET` before enabling the production reset flow.

## Quality commands

```bash
npm run db:validate
npm run db:generate
npm run typecheck
npm run lint
npm run test:unit
npm run build
```

To run the API smoke test against a built server:

```bash
npm run build
npm run start -- -p 3100
# in another terminal
set TEST_BASE_URL=http://localhost:3100
npm run test:api
```

The smoke test creates two temporary accounts, proves user isolation and unauthorized rejection, verifies real budget calculations and RLS flags, then deletes the temporary users.

## Project map

```text
app/                 routes, protected pages, API handlers, metadata files
components/          reusable logo, theme, analytics, and chart components
lib/auth/            password and session security
lib/validation/      Zod request validation
lib/                 API guards, rate limit, finance, Prisma, RLS context
prisma/              schema and ordered PostgreSQL migrations
tests/               deterministic unit tests
scripts/             database checks and production API smoke test
docs/                submission, defense, deployment, and user documents
```

## Documentation

- [Requirements specification](docs/REQUIREMENTS.md)
- [System architecture](docs/ARCHITECTURE.md)
- [Database design](docs/DATABASE-DESIGN.md)
- [API reference](docs/API-REFERENCE.md)
- [Security explanation](docs/SECURITY.md)
- [Testing and test cases](docs/TESTING.md)
- [Vercel/PostgreSQL deployment](docs/DEPLOYMENT.md)
- [User manual](docs/USER-MANUAL.md)
- [Project report outline](docs/PROJECT-REPORT-OUTLINE.md)
- [Supervisor defense guide](docs/DEFENSE-GUIDE.md)
- [Practical demonstration checklist](docs/DEMO-CHECKLIST.md)
- [Troubleshooting guide](docs/TROUBLESHOOTING.md)

## Production principles

Only the Next.js server connects to PostgreSQL. There is no browser database key and no admin/service credential in frontend code. `NEXT_PUBLIC_SITE_URL` and the Google Analytics measurement ID are public identifiers; database URLs, migration credentials, salts, and any paid-service secrets remain server-only. Use a restricted non-owner runtime database role so RLS is enforced, keep a separate migration credential, enable managed backups, and configure service billing caps and alerts.

See [deployment instructions](docs/DEPLOYMENT.md) for the exact local-to-production sequence.
