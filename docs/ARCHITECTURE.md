# Zariya — Enterprise Frontend Architecture Blueprint

**Status:** Adopted · **Owner:** Platform Frontend Guild · **Applies to:** every module and screen built on Zariya

This document is the architecture standard for the Zariya platform frontend. Everything described here is implemented in this repository today (with mock data services standing in for the real API) and is the pattern all future modules must follow.

---

## 0. Executive Summary

Zariya is a **modular monolith with plug-and-play modules**: one React application whose business domains (Donor Management, Reporting, Users, …) are self-contained module packages discovered through a **module registry**. The platform kernel (`src/core`) owns authentication, authorization, HTTP, and the registry; the shell (`src/app`) derives navigation and routing *from* the registry; modules own everything about their domain and know nothing about each other.

Key decisions:

| Decision | Choice |
|---|---|
| Language | React 19 + modern JavaScript (no TypeScript, per constraint) |
| Composition seam | Module registry + static manifests (Open/Closed Principle) |
| Authorization | Permission + policy engine — roles are *data* (permission bundles), never code branches |
| Signup | Accounts start `pending`; activation requires approval by **technology@a-pag.org** |
| Server state | TanStack Query behind per-module repositories |
| UI | MUI with a single platform theme (quiet, editorial, hairline aesthetic) |
| Data access | Axios singleton + Repository pattern per module |
| Forms | React Hook Form + Zod schemas |
| Testing | Vitest + React Testing Library (unit/component), Playwright (E2E) |

Why this survives 10+ years: modules only depend *downward* on a small, stable kernel contract (manifest shape, `can()` signature, `apiClient`). Teams add domains without touching shared code, so coordination cost stays flat as module count grows. When scale demands it, the same manifest seam becomes the Module Federation seam (§17) — evolution, not rewrite.

---

## 1. High-Level Architecture

**Philosophy:** *the platform is a kernel; business domains are plugins.* Dependencies flow strictly inward and downward. Nothing in `core` knows a module exists; nothing in one module knows another module exists.

```
┌───────────────────────────────────────────────────────────────┐
│  app/          shell · theme · router · providers · auth pages │
│  (derives everything from the registry — owns no domain logic) │
└───────────────▲───────────────────────────────▲───────────────┘
                │ registers manifests            │ renders routes
┌───────────────┴───────────────┐  ┌────────────┴───────────────┐
│  modules/donor-management     │  │  modules/reporting …        │
│  pages · components · hooks   │  │  (identical internal shape) │
│  repository · policies        │  │                             │
└───────────────▲───────────────┘  └────────────▲───────────────┘
                │ imports only ↓ core and ↓ shared               │
┌───────────────┴─────────────────────────────────┴─────────────┐
│  core/   api (axios) · auth (JWT+refresh) · authz (policy      │
│          engine, Can, guards) · registry                       │
│  shared/ presentational components (PageHeader, StatCard…)     │
└───────────────────────────────────────────────────────────────┘
```

**Dependency rules (enforced in review):**

- `core` imports nothing from `app`, `modules`, or `shared`.
- `shared` imports only `core` (rarely) — it is presentational.
- `modules/*` import `core` and `shared`. **Never each other. Never `app`.**
- `app` imports `core` and `shared`; it reads module *manifests* via the registry but never reaches into module internals.
- `src/modules/index.js` is the **only** file that names every module.

---

## 2. Project Folder Structure

```
src/
├── main.jsx                     # entry: registers modules, mounts <App/>
├── app/                         # OWNER: platform team
│   ├── App.jsx                  # providers + router composition root
│   ├── providers/AppProviders.jsx
│   ├── theme/theme.js           # the single MUI theme (design language)
│   ├── router/AppRouter.jsx     # routes generated from the registry
│   ├── layout/                  # AppShell, SideNav (dynamic nav), TopBar
│   └── pages/                   # auth pages (sign-in/up/pending), 403/404
├── core/                        # OWNER: platform team (most stable code)
│   ├── api/apiClient.js         # axios instance, auth + refresh interceptors
│   ├── auth/                    # AuthProvider, useAuth, authApi, tokenStorage
│   ├── authz/                   # actions, roles, policyEngine, useCan, Can,
│   │                            #   RequireAuth / RequireModuleAccess
│   └── registry/                # registerModule / getModules / nav groups
├── shared/                      # OWNER: design-system team
│   └── components/              # PageHeader, StatCard, ComingSoonPage…
└── modules/                     # OWNER: one team per module
    ├── index.js                 # THE single integration point
    ├── dashboard/
    └── donor-management/        # reference implementation (§18)
        ├── index.js             # manifest (id, title, icon, path, routes)
        ├── policies.js          # module-scoped policy registrations
        ├── api/donorRepository.js
        ├── hooks/useDonors.js   # TanStack Query hooks
        ├── lib/formatters.js
        ├── pages/               # route targets (lazy-loaded)
        └── components/          # module-private components
```

Folders inside a feature stay **flat** until a subfolder earns its existence. Barrel files (`index.js`) exist only at public API boundaries: `core/*`, `shared/components`, and each module root.

---

## 3. Feature Module Architecture

A module ships one **manifest** (its entire public API):

```js
export const donorManagementModule = {
  id: "donor-management",     // permission scope + route base
  title: "Donor Management",  // navigation label
  icon: VolunteerActivismOutlinedIcon,
  group: "Operations",        // nav group
  path: "/donor-management",
  order: 20,
  routes: [{ index: true, Component: lazy(() => import("./pages/DonorManagementPage.jsx")) }]
};
```

Registration (`src/modules/index.js`) is the only shared edit a new module requires. Navigation, routing, lazy chunks, and the permission scope all derive from the manifest — **Open/Closed in practice**.

**Communication rules**

| Allowed | Forbidden |
|---|---|
| module → `core` contracts (`useCan`, `apiClient`, registry) | module → module imports |
| module → `shared` presentational components | module → `app` imports |
| cross-module signals via URL/route state or server state | shared mutable singletons between modules |

If two modules need the same business logic, that logic moves *down* into `core` (or a new shared domain package) — never sideways.

---

## 4. Authentication

Implemented in `core/auth`. The mock `authApi` reproduces the production contract so the real backend can be swapped in without UI changes.

- **JWT + refresh:** short-lived access token (15 min) + rotating refresh token (7 days).
- **Token storage:** access token in **memory only**; refresh token + session snapshot in `localStorage` (XSS cannot steal what isn't stored; see §16).
- **Silent refresh:** `AuthProvider` schedules a refresh 60 s before expiry; `apiClient` also refreshes once on a 401 (deduplicated across concurrent requests) and retries.
- **Session restore:** on load, a valid refresh token rehydrates the session before routes render (`isRestoring` gate).
- **Multi-tab sync:** the `storage` event mirrors sign-in/sign-out across tabs instantly.
- **Route protection:** `RequireAuth` redirects anonymous users to `/sign-in`, preserving the intended destination.

**Signup with manual approval.** Registration creates an account with `status: "pending"` and the requested role. **technology@a-pag.org** must approve the account; until then sign-in is refused with an explicit "awaiting approval" message, and the policy engine denies everything (only `status: "active"` users pass `can()`). Role permissions therefore *activate* at approval time, not at signup.

```
Register ──► status: pending ──► approval by technology@a-pag.org ──► status: active
   │                │                                                     │
   ▼                ▼                                                     ▼
/pending-approval   sign-in blocked with explanation          role grants take effect
```

---

## 5. Authorization — Permission + Policy Based

`core/authz` answers every access question through one function:

```
can(user, action, moduleId, context?) =
     user.status === "active"
  ∧  some grant covers (moduleId, action)          ── permission check
  ∧  every registered policy allows the context    ── policy check
```

- **Actions** (`view`, `edit`, `comment`) are canonical verbs; new verbs (approve, export…) are added in one place.
- **Permissions** are `(module, action)` pairs; `module: "*"` covers all modules.
- **Roles are data** — named permission bundles in `roles.js`:

| Role | Grant |
|---|---|
| CEO | `*`: view, comment |
| Accounts / Finance Officer | `*`: view, edit, comment |
| Fund Raising Lead | `donor-management`: view, edit, comment (+ dashboard view) |

- **Policies** capture what roles cannot: ownership, record state, workflow stage. Modules register them at startup — e.g. Donor Management's `active-records-only` policy makes dormant donors read-only *for everyone*. Policies can only **restrict**, never grant (they run after the permission check).

**Enforcement surface** — all built on `can()`:

- `RequireModuleAccess` (route guard → 403)
- `<Can action module resource>` (declarative UI gating: buttons, fields, composers)
- `useCan()` (imperative checks in logic)
- `SideNav` + `HomeRedirect` (dynamic navigation — users never see modules they can't open)

**Adding a role or permission** = adding a data entry in `roles.js` / a policy registration. No component changes, because no component ever asks "is this user a CEO?" — it asks "can this user edit this donor?".

**Why not plain RBAC:** role checks scattered through components make every new role a codebase-wide audit, and they cannot express resource state ("dormant donors are read-only") or ownership. Permission+policy keeps authorization *centralized, data-driven, and testable* — the policy engine is pure functions with unit tests.

---

## 6. Routing

React Router 7, declarative routes generated from the registry (`AppRouter.jsx`):

- **Public:** `/sign-in`, `/register`, `/pending-approval` (redirect home when already authenticated).
- **Private:** `RequireAuth` → `AppShell` → per-module subtree wrapped in `RequireModuleAccess`.
- **Lazy loading:** every module page is `React.lazy` — each module is its own chunk (verified in the build output).
- **Errors:** `/forbidden` (403), catch-all 404 inside the shell.
- **`/`** resolves to the first module the user can view.

Nested routes belong to the owning module's manifest (`routes: [{ path: ":donorId", … }]`) — the platform router never enumerates them.

---

## 7. State Management

One table, applied everywhere:

| Data | Home | Why |
|---|---|---|
| Server data (donors, comments) | **TanStack Query** | caching, invalidation, retries, loading states for free |
| Session / identity | **AuthProvider context** | app-wide, changes rarely |
| Authorization | **derived** via `useCan` | never stored, so never stale |
| UI state (drawer open, dialog) | **`useState`** in the owning component | local by definition |
| Filters/search worth sharing | **URL params** | deep-linkable, survives refresh |
| Refresh token | **localStorage** | must survive reload, must sync tabs |
| Form state | **React Hook Form** | uncontrolled perf, validation integration |

There is deliberately **no global state library** (Redux/Zustand). Server cache + auth context + URL covers the platform's needs; a store would become a dumping ground that couples modules. Revisit only for genuinely global *client* state with high write frequency, which does not currently exist.

---

## 8. API Layer

- **`apiClient`** (`core/api`): one Axios instance — base URL from `VITE_API_BASE_URL`, bearer injection, 401→refresh→retry (single-flight), timeout, and error normalization to `{ message, status }` so UI code never parses Axios internals.
- **Repository per module** (`donorRepository`): the only place that knows endpoints and DTO shapes. It maps DTOs to domain objects, so a backend field rename touches one file. Today repositories run on in-memory data with simulated latency; swapping to `apiClient.get(...)` changes nothing above them.
- **Caching/cancellation/retries** live in TanStack Query configuration, not hand-rolled.

---

## 9. Business Logic

Logic lives *below* React, in plain JS that is unit-testable without rendering:

- **Policy layer** — `core/authz/policyEngine.js` (pure).
- **Domain services** — module `lib/` (formatters, calculations such as allocation %).
- **Use cases** — mutation flows composed in hooks (`useUpdateDonorMutation`), which orchestrate repository + cache invalidation.
- **Validation** — Zod schemas colocated with the forms that use them; shared schemas move to the module root.

Components stay presentational: they read hooks, render, and dispatch callbacks. A component that starts computing business rules is a review rejection (§21).

---

## 10. Shared Components & Design Language

`shared/components` + the single theme (`app/theme/theme.js`) are the design system. The visual language is **quiet, editorial, precise**: warm ivory canvas, ink text, hairline borders, one bronze accent, serif display type for headings, no gradients or heavy shadows — hierarchy comes from type, spacing, and hairlines.

Rules:

- Palette, radii, and type ramp live only in the theme; components use tokens (`divider`, `text.secondary`, `secondary.main`) — never hex literals.
- Shared components are composition-friendly (`PageHeader actions={...}`) and carry no domain knowledge.
- Accessibility: semantic landmarks (`nav`, `main`, `header`), labelled inputs, keyboard-reachable rows and dialogs (MUI primitives), WCAG-AA contrast on the ink/ivory pairs.
- Dark mode: add a second palette in the theme; because no component hardcodes color, no component changes.
- Full component documentation belongs in **Storybook** (one story per shared component; module stories optional) — standard tooling for this repo, to be wired in CI alongside tests.

---

## 11. Forms

React Hook Form + Zod everywhere (`zodResolver`):

- Schemas define the contract (`authSchemas.js`, `donorEditSchema`) — validation is data, reusable in tests.
- Server errors render in an `Alert`, never `window.alert`.
- Edit forms hydrate via RHF's `values` option (see `DonorEditDialog`), so reopening with a different record needs no manual reset.
- Wizard forms: one schema per step, accumulate in the parent, validate the union on submit. Autosave: watch + debounced mutation. File upload: repository-level `FormData` posts with progress from Axios.

---

## 12. Performance

- **Code splitting:** every module page is lazy; the build emits per-module chunks (Donor Management ≈ 18 kB gz, Dashboard ≈ 1.6 kB gz).
- **Suspense** fallback at the shell level keeps navigation responsive.
- **Query caching** (30 s stale time) eliminates refetch storms; mutation-scoped invalidation keeps updates precise.
- **Memoization** where derivation is real (`useMemo` for filtering/summaries); not sprinkled by default.
- **Virtualization** (e.g. `@tanstack/react-virtual`) is the standard once a table exceeds a few hundred rows.
- **Prefetching:** hover-driven `queryClient.prefetchQuery` for likely navigation targets as modules grow.

---

## 13. Error Handling

- Route-level errors: 403/404 pages; guards fail closed.
- API errors: normalized once in the interceptor; queries/mutations surface `error.message` directly.
- Form errors: field-level via Zod, submission-level via `Alert`.
- Next step as the platform hardens: an `ErrorBoundary` per module subtree (a crashing module must not take down the shell) reporting to the observability sink, and audit events for permission denials.

---

## 14. Testing Strategy

| Layer | Tool | Example in repo |
|---|---|---|
| Pure logic (highest ROI) | Vitest | `policyEngine.test.js` — role matrix, policy layering, fail-closed rules |
| Components | Vitest + RTL | `Can.test.jsx` — allowed renders children, denied renders fallback |
| E2E | Playwright | sign-in → role → gated UI → 403 (scripted in CI) |

Conventions: tests live in `__tests__/` beside the code; mock at the repository seam (never mock Axios in component tests); every new policy and every permission-gated control ships with a test proving both the allow and the deny path.

---

## 15. Coding Standards

- **Files:** components `PascalCase.jsx`; hooks `useX.js`; everything else `camelCase.js`; folders `kebab-case`.
- **Components:** function components only; presentational by default; one exported component per file (small private helpers allowed).
- **Hooks:** all data access through hooks; hooks never return JSX.
- **Imports:** respect the dependency rules in §1; no deep imports across module boundaries; barrels only at public APIs.
- **Naming:** module ids are kebab-case and double as permission scopes and route bases.
- **Lint:** ESLint flat config with `react`, `react-hooks` (already enforced — `npm run lint` must be clean).

---

## 16. Security

- **Token storage:** access token in memory; only the refresh token persists. On any refresh failure the session is destroyed (fail closed).
- **XSS:** React escaping everywhere; no `dangerouslySetInnerHTML`; no user HTML rendering.
- **CSRF:** bearer-token APIs are CSRF-immune (no ambient cookie auth); if cookies ever carry auth, switch to `SameSite=Strict` + CSRF tokens.
- **Permission checks are UX, not security:** the client hides and disables, but the server must re-check every mutation — client checks are treated as advisory by design.
- **Sensitive data:** the auth directory strips passwords before anything reaches app state; secrets live in env vars (`VITE_*` are public by definition — nothing secret goes there).
- **Approval gate:** pending users cannot authenticate *and* cannot pass `can()` — two independent denials.
- **Audit:** every approval, role change, and edit is an auditable server event (Audit Logs module consumes them).

---

## 17. Scalability & Evolution Path

The load-bearing property: **adding the Nth module costs the same as adding the 2nd** — one folder + one registry line. Nav, routes, chunks, and permission scopes scale mechanically; teams own modules end-to-end with no cross-team edits.

Growth path when team/codebase size demands independent deployment:

1. **Now — modular monolith** (this repo): one build, per-module chunks.
2. **Workspace split:** modules become workspace packages (`@zariya/donor-management`) with the same manifest contract; enforce boundaries with lint rules per package.
3. **Module Federation / micro frontends:** the manifest becomes the remote-entry contract — the registry loads manifests from federated remotes at runtime. Shell, kernel, and authorization model are unchanged; modules gain independent deploys.

Because every stage keeps the same seam (manifest + `can()` + repository), each step is an infrastructure change, not an application rewrite. The same seam admits N themes (theme registry), N languages (locale bundles per module), and N plugins (manifests contributed by customers/AI agents at runtime).

---

## 18. Example Module — Donor Management

The reference implementation (see folder layout in §2):

- **Manifest** registers id/route/nav; **`policies.js`** registers `active-records-only`.
- **Repository** owns data + DTO shape (list, update, comments).
- **Hooks** wrap it in TanStack Query with namespaced keys (`["donor-management", …]`).
- **Page** composes `PageHeader` + stat cards + register table + detail drawer.
- **Permission gating in action:**
  - `Can action=edit resource={donor}` → Edit button: visible to Finance Officer & Fund Raising Lead, absent for CEO, absent for *everyone* on dormant donors (policy).
  - `Can action=comment` → comment composer: visible to all three roles.
  - Route guard → Fund Raising Lead deep-linking to `/reporting` lands on 403.
- **Forms:** `DonorEditDialog` (RHF + Zod), mutation invalidates the module's query keys.

This module is the template: copy its shape, rename the domain, register the manifest.

---

## 19. Architecture Diagrams

**Permission flow**

```
<Can action module resource> ──► useCan() ──► can(user, action, module, ctx)
                                                │
                                    ┌───────────┴───────────┐
                                    │ user.status === active│──✗──► deny
                                    │ grant covers (m, a)?  │──✗──► deny
                                    │ all policies pass?    │──✗──► deny
                                    └───────────┬───────────┘
                                                ▼ allow → render / navigate
```

**Authentication flow**

```
sign-in ──► authApi ──► {access, refresh, user}
   │            ▲              │
   │            │ silent refresh (timer, 401 interceptor, storage event)
   ▼            │              ▼
tokenStorage (memory + localStorage) ──► AuthProvider context ──► guards/UI
```

**Data flow (Donor Management)**

```
Page ──► useDonorsQuery ──► donorRepository ──► apiClient ──► API
  ▲            │ cache ["donor-management","donors"]
  └── mutation.invalidate ◄── useUpdateDonorMutation ◄── DonorEditDialog
```

**Routing flow**

```
"/" ─► RequireAuth ─► AppShell ─► HomeRedirect ─► first can(view) module
"/x" ─► RequireAuth ─► RequireModuleAccess(x) ─► lazy page | /forbidden
unknown ─► 404
```

---

## 20. Common Mistakes This Architecture Prevents (selection)

1. Role names branched in components (`if (user.role === "ceo")`) → impossible here; only `can()` exists.
2. A "modules" switchboard edited by every team → registry manifest instead.
3. Server data copied into a global store → TanStack Query is the single server cache.
4. Axios imported ad hoc with duplicated auth handling → one client, one interceptor.
5. Tokens in localStorage wholesale → access token memory-only.
6. Navigation lists maintained by hand → derived from registry × permissions.
7. Cross-feature imports fossilizing into a big ball of mud → forbidden dependency direction.
8. Validation logic duplicated between UI and submit handlers → Zod schema is the single source.
9. Eager-loading the whole app → per-module lazy chunks by construction.
10. Permission checks forgotten on new buttons → `<Can>` is the only sanctioned pattern, checked in review.
11. New signups instantly active → status gate + approval authority baked into the auth contract.
12. Hex colors sprinkled per component → theme tokens only.
13. Business math inside JSX → `lib/` services, unit-tested.
14. Untestable auth logic woven through components → pure policy engine with a test matrix.
15. "Temporary" mock data leaking everywhere → mocks live behind the repository seam only.

(Reviewers: treat any reappearance of these as an architecture regression, not a style nit.)

---

## 21. Code Review Checklist

- [ ] New domain code lives in `modules/<id>/`; the only shared edit is the registry line.
- [ ] No imports between modules; no module importing `app`.
- [ ] Every route target is lazy; module routes declared in the manifest.
- [ ] All access decisions go through `can()` / `<Can>` / guards — zero role-name checks.
- [ ] Both allow and deny paths tested for new permissions/policies.
- [ ] Server data via repository + TanStack Query; no `fetch`/raw axios in components.
- [ ] Forms use RHF + Zod; server errors surfaced in the UI.
- [ ] Colors/spacing/type from the theme; no hardcoded hex.
- [ ] `npm run lint` and `npm test` clean; screenshots attached for visual changes.
- [ ] No secrets or tokens in code, storage patterns per §16.

---

## 22. Architecture Decision Records

**ADR-1 · Modular monolith over micro frontends (today).** MFEs buy independent deploys at the cost of runtime complexity, version skew, and payload duplication — costs not justified at current team size. The manifest seam keeps MFE as a later infrastructure step (§17). *Trade-off accepted:* single deploy cadence for now.

**ADR-2 · Permission+policy engine over RBAC.** RBAC couples UI to org structure and cannot express state/ownership rules. Grants + policies keep authorization data-driven and testable. *Trade-off:* slightly more upfront machinery than `user.role === x` — repaid on the first new role.

**ADR-3 · Registry + static manifests over convention-based file discovery.** Explicit registration is grep-able, type-checkable by lint, and works with any bundler; magic folder scanning breaks tooling and hides load order. *Trade-off:* one line per module in `modules/index.js` — deliberate, reviewable.

**ADR-4 · TanStack Query + context over Redux/Zustand.** ~90% of state is server cache; a client store would duplicate it and invite cross-module coupling. *Trade-off:* teams must learn query-key discipline (namespaced per module).

**ADR-5 · Access token in memory, refresh in localStorage.** Full-memory tokens log users out on refresh and break multi-tab; full-localStorage tokens maximize XSS blast radius. The split plus rotation and multi-tab sync is the balanced posture; httpOnly-cookie refresh is the server-side upgrade path.

**ADR-6 · Repository pattern over calling axios in hooks.** Endpoints/DTOs change more often than domains; the repository confines that churn to one file per module and gives tests a clean mock seam. *Trade-off:* one more layer — thin by design.

**ADR-7 · One MUI theme as the design system.** A bespoke component library costs years; raw MUI defaults look generic. Theming MUI heavily (ivory/ink/bronze, serif display) yields a distinctive, accessible system at library cost. *Trade-off:* MUI version migrations are platform-team work, done once for everyone.
