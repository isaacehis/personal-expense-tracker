# API Reference

All responses are JSON. Protected routes require the `expense_tracker_session` HttpOnly cookie. State-changing requests require an exact same-origin `Origin`/`Referer` and `Content-Type: application/json`; DELETE sends `{}`. Errors include `message` and `error: { code, message, fields? }`.

| Method | Route | Purpose | Key input |
|---|---|---|---|
| POST | `/api/auth/register` | Create user, defaults, session | `name,email,password,confirmPassword` |
| POST | `/api/auth/login` | Verify credentials and create session | `email,password` |
| POST | `/api/auth/logout` | Revoke current session and clear cookie | none |
| GET | `/api/auth/me` | Safe current user and expiry | none |
| GET | `/api/categories` | Owned categories | none |
| GET | `/api/transactions` | Search/filter/page owned transactions | `search,type,categoryId,month,dateFrom,dateTo,page,pageSize` |
| POST | `/api/transactions` | Create owned transaction | `type,amount,description,note,categoryId,transactionDate` |
| PATCH | `/api/transactions/:id` | Replace editable transaction values | same as POST |
| DELETE | `/api/transactions/:id` | Delete owned transaction | `{}` |
| GET | `/api/budgets` | Budget/actual list | `year,month` |
| POST | `/api/budgets` | Create category budget | `categoryId,amount,year,month` |
| PATCH | `/api/budgets/:id` | Edit owned budget | same as POST |
| DELETE | `/api/budgets/:id` | Delete owned budget | `{}` |
| PATCH | `/api/settings/profile` | Update name/email/currency/timezone | `name,email,currency,timezone` |
| PATCH | `/api/settings/password` | Verify/change password; revoke others | `currentPassword,newPassword,confirmPassword` |

## Status codes

- `200/201`: success/create
- `400`: invalid JSON fields or incompatible category
- `401`: missing/invalid session or credentials
- `403`: origin rejected
- `404`: owned resource not found (also used to avoid disclosing another owner)
- `409`: duplicate email or budget
- `413/415`: body too large or wrong content type
- `429`: authentication limit exceeded; read `Retry-After`
- `500`: generic internal failure; details stay in server logs

Amounts are returned as two-decimal strings to preserve monetary representation. Dates are ISO JSON values. Password hashes and session-token hashes are never response fields.
