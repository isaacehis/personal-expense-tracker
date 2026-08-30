# Project Report / Chapter Outline

## Preliminary pages

Title page, certification, declaration that acknowledges assisted tooling, dedication, acknowledgements, abstract, contents, list of figures/tables, and abbreviations.

## Chapter 1 — Introduction

- Background: difficulty of informal personal spending records
- Problem statement: fragmented, delayed, and non-private tracking
- Aim: build a secure multi-user personal expense tracking web system
- Objectives: transaction CRUD, monthly budgets, analytics, settings, security, testing, deployment
- Scope and limitations: manual entries, no bank/payment connection, no financial advice
- Significance and definition of terms

## Chapter 2 — Literature and existing systems

- Personal financial management concepts
- Budget-versus-actual analysis
- Web authentication/session approaches
- Multi-tenant authorization and relational integrity
- Review 3–5 genuine existing products using cited primary/academic sources
- Gap analysis and chosen contribution

Do not invent survey results, customer reviews, citations, or adoption statistics.

## Chapter 3 — Analysis and design

- Functional/non-functional requirements and use cases
- Architecture diagram and request flows
- ER diagram, data dictionary, normalization, indexes, constraints, RLS
- UI wireframes, navigation, mobile/accessibility decisions
- Threat model and security design
- Algorithms/pseudocode for balance, budget progress, and six-month grouping

## Chapter 4 — Implementation and testing

- Development tools and preserved Git process
- Next.js route groups, server/client components, route handlers
- Prisma adapter, migrations, validation, authentication, ownership
- Transaction, budget, analytics, settings, SEO/metadata implementation
- Test strategy, cases, actual command output, defects found/fixed
- Screenshots captured from the final real system, not fabricated mockups

## Chapter 5 — Results, conclusion, and recommendations

- Results mapped to each objective
- Security/performance/usability discussion
- Limitations: manual entry, no MFA/recovery/export/recurring rules
- Conclusion
- Recommendations: MFA, verified recovery, audit trail, data export, notifications, managed limiter, formal usability study

## End matter

References in the institution’s required style; appendices for API, schema, test cases, user manual, selected source excerpts, Git log, and deployment configuration without credentials.
