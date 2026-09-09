# Production PostgreSQL and Vercel Deployment

## 1. Provision infrastructure

1. Create a production PostgreSQL database with SSL, regional proximity, backups/PITR, connection pooling, and alerts.
2. Create a migration owner credential and a separate non-owner runtime credential. Never expose either in frontend code.
3. In every paid provider, set a hard spend cap where available and usage alerts at 50%, 80%, and 100%. Configure database storage/connection/availability alerts as well.
4. Create a Vercel project from the Git repository; use Node.js LTS.

## 2. Roles and RLS

Run migrations with the owner credential. Then, as owner, create/grant a restricted runtime role (adapt names to the provider):

```sql
CREATE ROLE expense_app LOGIN PASSWORD 'provider-generated-strong-password';
GRANT CONNECT ON DATABASE production_database TO expense_app;
GRANT USAGE ON SCHEMA public TO expense_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO expense_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO expense_app;
```

Do not grant table ownership, superuser, or `BYPASSRLS`. Verify:

```sql
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname IN ('users','categories','transactions','budgets','sessions','rate_limits');
```

All values must be true. Test with two real staging users.

## 3. Environment variables

Copy names from `.env.example` into Vercel Environment Variables:

- `DATABASE_URL`: restricted runtime/pooler URL; server-only.
- `RATE_LIMIT_SALT`: at least 32 random characters; server-only.
- `PASSWORD_RESET_SECRET`: a separate random value of at least 32 characters; server-only.
- `RESEND_API_KEY`: server-only email API credential used for password recovery.
- `PASSWORD_RESET_FROM`: sender on a domain verified by the email provider.
- `NEXT_PUBLIC_SITE_URL`: final HTTPS origin without trailing slash.
- `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`: optional GA4 `G-...` public identifier.
- `GOOGLE_SITE_VERIFICATION`: optional Search Console token.

`SHADOW_DATABASE_URL` is development-only. Do not add `.env` to Git. Never prefix database URLs, admin tokens, or secrets with `NEXT_PUBLIC_`.

## 4. Local-to-production migration

1. Back up the target and test all migrations against staging.
2. In a trusted deployment terminal/CI step, temporarily provide the migration-owner URL as `DATABASE_URL` and run `npm run db:migrate:deploy`.
3. Restore/use the restricted runtime `DATABASE_URL` in Vercel.
4. Deploy the exact tested commit. `npm run build` generates Prisma client and runs Next build; it intentionally does not mutate production schema.
5. Smoke-test registration, login, password recovery, transaction CRUD, budgets, analytics, settings, user isolation, logout, `/robots.txt`, and `/sitemap.xml`.

Never run `migrate dev`, reset, forced db push, or data-loss flags in production.

## 5. Domain, Search Console, and Analytics

1. Attach the domain in Vercel and redirect all variants to one HTTPS origin.
2. Set `NEXT_PUBLIC_SITE_URL` to that origin and redeploy.
3. Create a Google Search Console Domain property (recommended DNS verification) or use the configured HTML verification token; submit `/sitemap.xml` after verification.
4. If analytics is appropriate, create GA4, set the measurement ID, document consent/legal requirements, and verify events in Realtime. Leave the variable absent to load no Google script.

## 6. Release and rollback

- Run all commands in `docs/TESTING.md`, review `git diff`, and tag the release.
- Keep database backups before migrations and Vercel’s previous deployment ready.
- Application rollback can promote the last deployment; database rollback requires a reviewed forward-fix or provider restore, never an unreviewed destructive command.
