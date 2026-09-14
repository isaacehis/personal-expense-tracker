# 💰 ExpenseTrack

## Personal Finance & Expense Management Platform

ExpenseTrack is a secure full-stack personal finance web application designed to help users record income and expenses, manage monthly category budgets, monitor spending patterns, and understand their financial activity through an interactive dashboard.

The application combines a responsive user experience with secure authentication, PostgreSQL-backed data storage, financial analytics, account-management tools, per-user authorization, and production-focused security controls.

ExpenseTrack was developed as my Computer Science final-year project and demonstrates practical experience with full-stack web development, database design, API development, authentication, security, testing, and responsive interface development.

---

## ✨ Key Features

- Secure user registration, login, logout, and password recovery
- Current-user lookup and database-backed sessions
- Income and expense tracking
- Multi-user transaction CRUD
- Search and filtering of transactions
- Filter transactions by type, category, date, and month
- Pagination for transaction history
- Monthly category budget management
- Actual spending calculations
- Overspending warnings
- Financial dashboard totals
- Six-month income and expense analytics
- Category-based spending analysis
- Recent financial activity
- User profile management
- Unique user email handling
- Currency preferences
- Timezone preferences
- Verified password updates
- Revocation of other sessions after password changes
- Responsive light and dark interface
- Keyboard focus and accessible labels
- Loading, error, and empty states
- Breadcrumb navigation
- Custom 404 page
- Mobile-friendly calls to action
- Privacy policy and FAQ pages
- Favicon and Open Graph support
- Metadata, robots, and sitemap configuration
- Optional Google Analytics integration
- Search Console verification support
- Unit testing
- Production-server API isolation smoke testing

---

## 🛠 Technology

- **Next.js 16.3 App Router**
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **PostgreSQL**
- **Prisma ORM 7.10**
- **@prisma/adapter-pg**
- **Zod 4**
- **Argon2id**
- **Node.js test runner**
- **ESLint**
- **Git & GitHub**

---

## 🔐 Security

Security is a core part of ExpenseTrack.

The application includes:

- Argon2id password hashing
- SHA-256 session-token hashing
- HttpOnly cookies
- Same-origin request validation
- JSON request validation
- Server-side request validation
- Per-user authorization
- PostgreSQL Row-Level Security
- Database-backed rate limiting
- Session revocation after password changes
- Protected authenticated routes
- Server-only database credentials
- Separate migration and runtime database access
- Secure password-reset controls

Sensitive database credentials, API keys, salts, passwords, migration credentials, and application secrets are stored outside the repository and should never be committed to Git.

---

## 🗄 Database & Application Architecture

ExpenseTrack uses PostgreSQL as its primary database.

Prisma ORM is used for database access, schema management, migrations, and application data operations.

Only the Next.js server communicates directly with PostgreSQL.

There is no browser database key and no privileged database credential exposed in frontend code.

The application uses authorization checks and PostgreSQL Row-Level Security to help ensure users can only access their own financial records.

A restricted non-owner runtime database role should be used in production so Row-Level Security remains enforced.

Migration credentials should remain separate from runtime database credentials.

---

## 💳 Transaction Management

Users can create, read, update, and delete financial transactions.

Transactions can be searched and filtered using:

- Transaction type
- Category
- Date
- Month

Pagination is included to keep transaction history manageable as the amount of stored data increases.

---

## 🎯 Budget Management

Users can create and manage monthly category budgets.

ExpenseTrack provides:

- Monthly category budgets
- Actual spending calculations
- Remaining budget information
- Overspending warnings
- Category-based financial analysis

This allows users to compare planned spending against actual expenses.

---

## 📊 Dashboard & Analytics

The dashboard provides a high-level overview of the user's financial activity.

It includes:

- Total income
- Total expenses
- Financial balance information
- Six-month income and expense chart
- Category analysis
- Budget information
- Recent transaction activity

Dashboard values are generated from PostgreSQL-backed application data.

---

## 👤 Account Management

Users can manage:

- Profile information
- Email address
- Preferred currency
- Timezone
- Password

Password changes are verified securely.

After a password change, other active sessions can be revoked to improve account security.

---

## 🔑 Password Recovery

Password-recovery email functionality uses Resend.

Production password recovery requires secure configuration of:

```text
RESEND_API_KEY
PASSWORD_RESET_FROM
PASSWORD_RESET_SECRET
```

These values must be stored securely in environment variables and must never be committed to the repository.

---

## 🚧 Project Status

ExpenseTrack is an actively maintained full-stack application.

The core functionality has been implemented, including:

- Authentication
- Transaction management
- Budget management
- Financial analytics
- Profile management
- Password recovery
- Database security
- Responsive UI
- Testing
- Production-oriented security controls

The project may continue to receive improvements as additional features, optimizations, and production testing are completed.

---

## 🔮 Future Improvements

Potential future improvements include:

- Additional financial reports
- More advanced dashboard visualizations
- Transaction export functionality
- Downloadable financial reports
- Additional budgeting insights
- Improved financial forecasting
- Additional notification features
- More advanced monitoring
- Further production testing
- Additional accessibility improvements

---

## 💻 Quick Start

### Requirements

- Node.js 20+  
- npm
- PostgreSQL
- A separate empty shadow database for development migrations

Install dependencies:

```bash
npm install
```

Create your local environment file from:

```text
.env.example
```

On Windows, you can use:

```bash
copy .env.example .env
```

Edit `.env` with your local credentials.

Never commit the real `.env` file.

Validate the database configuration:

```bash
npm run db:validate
```

Deploy migrations:

```bash
npm run db:migrate:deploy
```

Generate the Prisma client:

```bash
npm run db:generate
```

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

Create an account and use the generated default categories.

---

## 🧪 Quality Commands

Validate the database configuration:

```bash
npm run db:validate
```

Generate Prisma:

```bash
npm run db:generate
```

Run TypeScript checks:

```bash
npm run typecheck
```

Run linting:

```bash
npm run lint
```

Run unit tests:

```bash
npm run test:unit
```

Create a production build:

```bash
npm run build
```

---

## 🧪 Production API Smoke Test

To run the API smoke test against a built server:

```bash
npm run build
npm run start -- -p 3100
```

In another terminal:

```bash
set TEST_BASE_URL=http://localhost:3100
npm run test:api
```

The smoke test:

- Creates two temporary accounts
- Verifies unauthorized request rejection
- Confirms user isolation
- Verifies budget calculations
- Checks Row-Level Security flags
- Deletes the temporary users after testing

---

## 📂 Project Structure

```text
app/                 Application routes, protected pages, API handlers, and metadata
components/          Reusable UI, logo, theme, analytics, and chart components
lib/auth/            Password and session security
lib/validation/      Zod request validation
lib/                 API guards, rate limiting, finance logic, Prisma, and RLS context
prisma/              Database schema and ordered PostgreSQL migrations
tests/               Deterministic unit tests
scripts/             Database checks and production API smoke testing
docs/                Technical, deployment, submission, defense, and user documentation
public/              Public application assets
```

---

## 📚 Documentation

The repository includes detailed project documentation.

### Requirements Specification

[Requirements specification](docs/REQUIREMENTS.md)

### System Architecture

[System architecture](docs/ARCHITECTURE.md)

### Database Design

[Database design](docs/DATABASE-DESIGN.md)

### API Reference

[API reference](docs/API-REFERENCE.md)

### Security

[Security explanation](docs/SECURITY.md)

### Testing

[Testing and test cases](docs/TESTING.md)

### Deployment

[Vercel/PostgreSQL deployment](docs/DEPLOYMENT.md)

### User Manual

[User manual](docs/USER-MANUAL.md)

### Project Report

[Project report outline](docs/PROJECT-REPORT-OUTLINE.md)

### Project Defense

[Supervisor defense guide](docs/DEFENSE-GUIDE.md)

### Demonstration

[Practical demonstration checklist](docs/DEMO-CHECKLIST.md)

### Troubleshooting

[Troubleshooting guide](docs/TROUBLESHOOTING.md)

---

## 🌐 Production Principles

Only the Next.js server connects directly to PostgreSQL.

There is no browser database key and no admin or service credential exposed in frontend code.

Public identifiers such as `NEXT_PUBLIC_SITE_URL` and the optional Google Analytics measurement ID may be exposed where appropriate.

The following must remain server-only:

- Database URLs
- Database passwords
- Migration credentials
- Runtime database credentials
- Rate-limit salts
- Password-reset secrets
- API keys
- Paid-service credentials
- Private tokens

Production deployments should use:

- Restricted non-owner runtime database access
- Separate migration credentials
- PostgreSQL Row-Level Security
- Secure environment variables
- HTTPS
- Managed database backups
- Service billing limits and alerts
- Secure authentication controls
- Authorization checks
- Monitoring and error handling

See the deployment documentation for the full local-to-production sequence:

[Deployment instructions](docs/DEPLOYMENT.md)

---

## 🔒 Environment Variables

Use `.env.example` as a template for local configuration.

Example variable categories include:

```text
DATABASE_URL
SHADOW_DATABASE_URL
RATE_LIMIT_SALT
PASSWORD_RESET_SECRET
RESEND_API_KEY
PASSWORD_RESET_FROM
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
GOOGLE_SITE_VERIFICATION
```

Never commit real production values for these variables.

---

## 📱 Responsive Experience

ExpenseTrack is designed to work across desktop and mobile devices.

The interface includes:

- Responsive layouts
- Mobile-friendly navigation
- Light and dark themes
- Accessible labels
- Keyboard focus states
- Loading states
- Error states
- Empty states
- Breadcrumb navigation
- Mobile calls to action
- Custom 404 handling

---

## ⚙️ Engineering Practices

The project demonstrates experience with:

- Full-stack application development
- Server-side rendering and routing
- REST-style API development
- Database schema design
- Authentication
- Authorization
- Input validation
- Secure password storage
- Session management
- Database migrations
- Row-Level Security
- Rate limiting
- Responsive design
- Error handling
- Unit testing
- API testing
- Production builds
- Git version control
- Technical documentation

---

## 🎓 Project Context

ExpenseTrack was developed as my final-year Computer Science project.

The project was designed to demonstrate practical application of software engineering concepts including:

- Software design
- Database systems
- Web development
- Application security
- Authentication
- API development
- Testing
- User experience
- Technical documentation
- Deployment preparation

---

## 👨‍💻 Developer

**Ehigie Isaac Nosa**

Computer Science student and software developer focused on building secure, responsive, and user-friendly web applications.

📍 Lagos, Nigeria

### Areas of Interest

- Software Development
- Web Development
- Full-Stack Development
- Frontend Development
- Database Development
- UI/UX
- Software Engineering

---

## 📌 Disclaimer

ExpenseTrack is a personal finance web application and academic software project.

It does not provide financial, investment, accounting, or banking advice.

Users should protect their own credentials and avoid storing sensitive production information in development environments.