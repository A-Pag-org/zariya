# Zariya — Budgeting, Trading & Reporting

A [The Convergence Foundation](https://www.theconvergencefoundation.org) product. Modular enterprise frontend: a platform kernel (auth, permissions, module registry) hosting plug-and-play business modules mapped to the Zariya scope — Budget, Forecast, Actuals, Variance, Committed (Trading), Unassigned Funding, Donor Management, Optimiser, Reporting, and Governance. Donor Management is the reference module.

**Architecture standard:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Stack

React 19 · JavaScript · Vite · React Router · MUI · Axios · TanStack Query · React Hook Form + Zod · Vitest + Testing Library

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit/component tests
npm run lint
npm run build
```

## Demo accounts

Password for all: `Zariya#2026`

| Email | Role | Access |
|---|---|---|
| ceo@theconvergencefoundation.org | CEO | View + comment, all modules |
| finance@theconvergencefoundation.org | Accounts / Finance Officer | View + edit + comment, all modules |
| fundraising@theconvergencefoundation.org | Fund Raising Lead | View + edit + comment, Donor Management only |

New registrations stay **pending** until approved by technology@theconvergencefoundation.org (simulated in the mock auth service).
