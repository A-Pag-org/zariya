# Zariya — A-PAG Operations Platform

Modular enterprise frontend: a platform kernel (auth, permissions, module registry) hosting plug-and-play business modules. Donor Management is the reference module.

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
| ceo@a-pag.org | CEO | View + comment, all modules |
| finance@a-pag.org | Accounts / Finance Officer | View + edit + comment, all modules |
| fundraising@a-pag.org | Fund Raising Lead | View + edit + comment, Donor Management only |

New registrations stay **pending** until approved by technology@a-pag.org (simulated in the mock auth service).
