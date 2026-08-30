# Practical Demonstration Checklist

## Before the room

- [ ] Use the final commit and clean `git status`.
- [ ] Keep `.env` hidden; never open it on screen.
- [ ] Start PostgreSQL; run Prisma status/validate and production build.
- [ ] Prepare two non-sensitive demo accounts and realistic manual records.
- [ ] Test projector width and one narrow mobile-width window.
- [ ] Keep this checklist, architecture, ERD, schema, and defense guide open.

## Ten-minute flow

- [ ] Landing: show CTA, internal links, FAQs, theme, favicon, mobile layout.
- [ ] Register: explain validation, Argon2id, default categories, HttpOnly session.
- [ ] Protected route: show unauthenticated rejection in a private browser or API response.
- [ ] Transactions: add income and expense; search; type/category/month/date filter; paginate; edit; delete.
- [ ] Budgets: create a category budget and add expense above it; show warning and real actual.
- [ ] Dashboard/analytics: explain income, expense, balance, six-month bars, category and budget progress.
- [ ] Settings: change currency/timezone; explain unique email; demonstrate current-password verification (avoid showing password).
- [ ] Isolation: sign in as account B and prove account A’s record is absent; show API smoke result.
- [ ] Mobile: show working bottom navigation/sticky Add CTA, no covered content, and keyboard focus.
- [ ] Quality: show passing validation, tests, TypeScript, ESLint, build, Git log, and documentation.

## Security points to say

- Browser has no database/admin key.
- Password and session token hashes never appear in API JSON.
- Every resource operation includes user ownership, not only login.
- Prisma parameterizes input; database constraints/RLS add defense in depth.
- No system is “100% secure”; production operations remain necessary.

## Do not claim

- Do not claim real reviews, customers, bank integration, external audit, penetration test, perfect security, or unassisted authorship.
- Do not expose `.env`, database URLs, passwords, session cookies, or provider dashboards with secrets.
