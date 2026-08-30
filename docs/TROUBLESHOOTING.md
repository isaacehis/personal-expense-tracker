# Troubleshooting Guide

## Database connection fails

- Confirm PostgreSQL is running and `DATABASE_URL` uses the correct host, port, database, user, password, and SSL mode.
- Verify the runtime role has CONNECT, schema USAGE, table CRUD, and no table ownership/BYPASSRLS.
- Run `npx prisma debug`, `npm run db:validate`, and `npx prisma migrate status` without posting credential output publicly.
- On serverless production, use the provider pooler URL and respect connection limits.

## Migration or generated client mismatch

- Development: review schema/migration, run `npx prisma migrate dev`, then `npm run db:generate`.
- Production: back up, use the migration-owner credential, run only `npm run db:migrate:deploy`, then redeploy.
- Never reset or accept data loss to “fix” production drift.

## RATE_LIMIT_SALT error

Production intentionally refuses login/registration without `RATE_LIMIT_SALT`. Add a long random value in the server/deployment environment and restart. Do not prefix it with `NEXT_PUBLIC_`.

## Login works but protected pages redirect

- Use the same scheme/domain and HTTPS in production.
- Confirm the cookie exists, is not expired, is HttpOnly, and Secure is compatible with HTTPS.
- Check the session row is unrevoked and its hashed token matches; never log the raw token.
- Confirm server clock and database clock are correct.

## State-changing API returns 403 or 415

- Send requests from the same origin as the API.
- Set `Content-Type: application/json` and valid JSON. DELETE requests in this API send `{}`.
- If a proxy changes host/scheme, configure its forwarded headers and canonical deployment origin correctly.

## Data or charts appear empty

- Confirm the signed-in owner, transaction type/category/date, selected month, and user timezone.
- Budgets only count EXPENSE transactions with the same category in the selected month.
- Use `/api/transactions` or `/api/budgets?year=YYYY&month=M` while authenticated to inspect safe responses.

## Build fails

- Use Node.js LTS, run `npm ci`, `npm run db:generate`, `npm run typecheck`, and `npm run lint`.
- The app uses system fonts, so it does not need Google Fonts network access at build time.
- Delete only the exact `.next` build cache if appropriate, then rebuild; never delete the repository or user data.

## Analytics/Search Console absent

- Analytics loads only for a valid `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-...`; redeploy after changing it.
- Search Console verification requires the real token/domain. Set `GOOGLE_SITE_VERIFICATION`, redeploy, verify, then submit the sitemap shown at `/sitemap.xml`.
- Browser blockers and consent tools may intentionally block analytics.

## Theme or mobile navigation issue

- Clear only the `expense-track-theme` localStorage key or select the toggle again.
- Test at 320px width and confirm page content has bottom padding for the fixed navigation.

## Safe support information

Share error messages, timestamps, route/status, commit hash, runtime versions, and sanitized logs. Never share `.env`, raw cookies, tokens, password hashes, user finance records, or full database URLs.
