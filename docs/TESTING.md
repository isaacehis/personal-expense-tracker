# Testing Documentation and Test Cases

## Strategy

The project uses five verification layers: schema, pure unit, static analysis, live API integration, and optimized production build. Tests use temporary accounts and real PostgreSQL calculations; no mock finance data is used by application pages.

## Automated commands and expected result

| Command | Verifies | Expected |
|---|---|---|
| `npm run db:validate` | Prisma schema/config | valid schema |
| `npm run db:generate` | Prisma client generation | generated successfully |
| `npm run test:unit` | validation and finance helpers | 8 passing tests |
| `npm run typecheck` | TypeScript contracts and route types | exit 0 |
| `npm run lint` | Next/React/accessibility-oriented rules | exit 0 |
| `npm run test:api` | live security and finance behaviors | smoke test passed |
| `npm run build` | complete production compilation/routes | build succeeds |

The Windows test preload only works around a Node 24 `os.userInfo()` failure in constrained shells before `tsx` starts; it does not alter application or test results.

## Automated cases

| ID | Case | Expected |
|---|---|---|
| UT-01 | Valid and invalid registration | normalized email; bad inputs rejected |
| UT-02 | Money/date transaction validation | 2-decimal valid date accepted; bad precision/date rejected |
| UT-03 | Month and budget bounds | invalid month/year/amount rejected |
| UT-04 | Profile/password settings | supported currency/timezone accepted; mismatch rejected |
| UT-05 | Balance/rounding | exact two-decimal result |
| UT-06 | Budget percentage | normal, overspent, and zero-budget behavior |
| UT-07 | Leap-month range | exclusive March boundary after February |
| UT-08 | Six-month series | records aggregate to correct type/month |
| API-01 | Transaction GET without cookie | 401 |
| API-02 | Login from foreign origin | 403 |
| API-03 | Login wrong content type | 415 |
| API-04 | Registration | 201, HttpOnly cookie, no password hash response |
| API-05 | User A creates and lists transaction | record visible to A |
| API-06 | User B lists/searches | A’s record absent |
| API-07 | User B deletes A’s ID | 404; record unchanged |
| API-08 | Overspent category budget | actual 50.00 vs budget 40.00, overspent true |
| API-09 | Database RLS flags | all six tables enabled |

## Manual responsive/accessibility cases

- Test 320, 375, 768, 1024, and 1440 CSS-pixel widths.
- Navigate every link/button with keyboard only; focus must remain visible.
- Verify light/dark theme persists across navigation and system default works on first visit.
- Submit empty/invalid/valid transaction, budget, login, registration, profile, and password forms.
- Verify screen-reader labels for navigation, filters, forms, status messages, and charts.
- Confirm mobile bottom navigation does not cover the final content and the Add CTA opens the transaction form.
- Verify `/missing-page` shows the custom 404 and links return home/dashboard.

## Latest completed run

On 30 August 2026: Prisma validate/generate passed; 8/8 unit tests passed; TypeScript and ESLint passed; API smoke passed; Next.js production build passed. The in-app visual browser runtime was unavailable because its Node process was denied access to a Windows profile path, so browser screenshots were not claimed.
