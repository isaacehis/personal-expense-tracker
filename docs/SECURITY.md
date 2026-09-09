# Security Explanation

No application can honestly be described as “100% secure.” ExpenseTrack applies layered controls and documents the operational work required to keep them effective.

## Implemented controls

- Authentication: generic login errors; Argon2id with explicit memory/time settings; a fake hash path reduces user-existence timing differences. Password-reset links expire after 30 minutes, are HMAC-signed, and become invalid as soon as the password changes.
- Sessions: 256-bit random tokens; only SHA-256 hashes in PostgreSQL; seven-day expiry; revocation; HttpOnly, SameSite=Lax, path-scoped cookies with Secure enabled in production.
- Authorization: every finance query includes authenticated `userId`; updates/deletes use compound ID-and-owner predicates; category/type ownership is checked before a write.
- Database: foreign keys, unique/check constraints, RLS on every table, transaction-local context, parameterized Prisma tagged queries, and no unsafe query construction.
- Request boundary: maximum body indication, valid JSON, Zod server validation, required JSON content type, and Origin/Referer comparison for state changes.
- Abuse protection: registration, login, and password-reset identifiers are salted one-way hashes in PostgreSQL; serializable rate-limit updates work across horizontally scaled servers. Reset requests use the same response for existing and unknown email addresses.
- Browser: nonce CSP, frame denial, MIME sniffing prevention, restricted permissions, strict referrer policy, COOP, HSTS, and no framework signature header.
- Secrets: browsers receive no database key. Database credentials, `RATE_LIMIT_SALT`, `PASSWORD_RESET_SECRET`, and the email API key are server-only. Public site URL and GA measurement ID are identifiers, not privileged keys.
- Data minimization: explicit Prisma `select` lists exclude password/session hashes. Server logs record errors, not request credentials.

## RLS and role model

RLS supplements—never replaces—application authorization. A restricted production runtime role is subject to RLS. The migration/table-owner role is separate and used only for controlled deployment. PostgreSQL owners and roles with `BYPASSRLS` must never be the public runtime credential.

This is not Supabase, so there is no “public database key” to put in frontend code. Adding one would weaken the architecture. If the database provider supplies admin/service tokens, store them only in the deployment secret manager.

## Required production operations

- Enforce HTTPS; rotate database password and rate-limit salt after exposure.
- Enable provider backups/PITR, audit access, connection limits/pooling, availability alerts, and dependency/security update monitoring.
- Configure hard billing caps where supported and alerts at 50%, 80%, and 100% for Vercel, database, analytics, email, storage, or other paid services.
- Apply least-privilege roles and periodically prove a second account cannot access the first account’s records.
- Add a retention/account-deletion procedure before accepting real public users.
- Consider MFA, verified-email recovery, centralized Redis/managed limiter, audit logging, and a professional penetration test for a high-risk public launch.

## Threat/control examples

| Threat | Control |
|---|---|
| SQL injection | Prisma parameters/tagged templates; no string-built SQL |
| CSRF | SameSite cookie plus exact same-origin mutation check |
| Session theft database leak | Stored token is SHA-256 hash, not browser token |
| Credential stuffing | Generic errors, Argon2 cost, shared database rate limits |
| Insecure direct object reference | `id + userId` predicates and RLS |
| XSS impact | React escaping, sanitized static JSON-LD, nonce CSP |
| Secret disclosure | server-only environment values and `.env*` Git ignore |
| Clickjacking | CSP `frame-ancestors 'none'` and X-Frame-Options DENY |

Security findings must be fixed before deployment, never hidden for grading.
