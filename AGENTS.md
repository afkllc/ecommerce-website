# AGENTS.md instructions for C:\Users\saqla\Documents\ecommerce-website

<INSTRUCTIONS>
## Project Context

You are working on **AllPencils**, a reusable ecommerce storefront template currently demoed as a pencil shop. The goal is a polished, fast, demo-ready storefront that a developer can sell to clients as a template. The product must stay generic: future clients replace catalogue, branding, and copy.

**Primary user:** shoppers browsing and purchasing products online.
**Secondary user:** store owner managing products through Medusa Admin after handoff.

Current build stage: **Phase 2 hardening - cart and no-card simulated checkout**.

Done-ish:
- Product list and product detail routes exist.
- Product routes use the Medusa Store API through `apps/storefront/src/lib/medusa`.
- Product routes use ISR with a 60-second revalidation window.
- Cart, quantity updates, no-card checkout address/contact flow, and order confirmation exist.

Not done:
- Final homepage.
- Simulated recommendations.
- Scripted shopping assistant.
- Visual polish pass.
- Full production verification and live checkout smoke test.

Next gate before any Phase 3 work:
- Verify cart/checkout end to end against the live Medusa backend.
- Remove phase/internal demo copy from shopper-facing UI.
- Run storefront lint/typecheck/build, backend build, backend integration test or exact `.env.test`/Postgres blocker.
- Run a live checkout smoke test without printing secrets.

---

## Stack & Architecture

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 14, App Router, TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Ecommerce backend | Medusa.js v2 |
| Database | PostgreSQL, Neon-managed in hosted environments |
| Frontend hosting | Vercel |
| Backend hosting | Render |
| Checkout | No-card simulated checkout using Medusa shipping/payment provider data |
| Payments | Stripe Elements is not implemented unless explicitly requested |
| AI features | Planned simulated features only; no external AI API calls |

Hosting is intentionally split: the Next.js storefront deploys to Vercel, while the Medusa application deploys to Render and uses Neon for PostgreSQL. Do not propose a fully Vercel-only or Netlify-only Medusa deployment unless the architecture changes away from self-hosted Medusa. If zero paid hosting is required, call it prototype-grade and account for free-tier sleep/cold-start behavior.

The storefront consumes Medusa through the service layer in `apps/storefront/src/lib/medusa`. Components must not call Medusa endpoints directly.

Planned simulated AI work is Phase 3. The recommendation module and assistant JSON are not current code. Do not claim they exist, and do not add real AI calls unless explicitly instructed.

---

## Hard Rules

1. **No hardcoded secrets, credentials, deploy URLs, API URLs, tokens, passwords, or keys in source.** Use env files locally and hosting dashboards in production.
2. **Demo seed catalogue constants are allowed only in seed/data files.** Keep product names, SKUs, handles, category slugs, and seed-only business data out of runtime storefront logic when possible.
3. **No direct Medusa API calls from components.** All Medusa calls go through `apps/storefront/src/lib/medusa`.
4. **No raw `<img>` tags.** Use `next/image` for rendered images.
5. **No inline styles.** Use Tailwind utilities or shadcn/ui components.
6. **TypeScript only in the storefront.** No `.js` or `.jsx` files in the Next.js project.
7. **No external AI API calls.** Simulated AI must be static, scripted, or rule-based.
8. **No raw card number, expiry, or CVC collection.** Only add card collection if Stripe Elements is actually implemented.
9. **No new libraries without explicit approval.** State dependency, purpose, risk, and wait.
10. **No secrets in output.** If a secret exists, report path/type only.

---

## Scope

In scope:
- Next.js storefront pages, components, routing, layout, data fetching.
- Medusa backend configuration, plugins, scripts, Store API integration.
- Cart and no-card checkout flow.
- Planned simulated AI features when Phase 3 starts.
- Tailwind and shadcn/ui styling.
- ISR for product and catalogue pages.
- Environment variable setup and `.env.example` maintenance.

Out of scope unless explicitly instructed:
- Live payment processing or live Stripe keys.
- User accounts/authentication.
- Transactional email.
- Real LLM/AI API calls.
- Discount/promotions engine.
- Multi-currency or multi-language support.
- Search.
- Mobile app or PWA work.
- Shopify integration.

---

## Skills & Activation

Available local skills may include:

- using-superpowers
- caveman
- agents-md-improver
- brainstorming
- code-explorer
- code-reviewer
- security-review
- systematic-debugging
- test-driven-development
- receiving-code-review
- executing-plans
- verification-before-completion
- frontend-design
- writing-plans
- code-architect

Default activation for meaningful tasks:
- `using-superpowers`
- `caveman`
- `code-explorer`
- `code-reviewer`
- `verification-before-completion`

Add:
- `frontend-design` for UI, responsiveness, accessibility, visual QA, or UX critique.
- `security-review` for env, secrets, payments, auth, API boundaries, webhooks, deployment config, or audits.
- `systematic-debugging` before fixing bugs, failing checks, runtime errors, broken flows, or confusing symptoms.
- `test-driven-development` before feature work or bugfixes that can be tested.
- `receiving-code-review` when acting on audit findings or review feedback.
- `writing-plans` or `code-architect` for multi-step features, schema changes, large refactors, or unclear architecture.
- `executing-plans` when implementing a written plan.
- `requesting-code-review` or `code-review` before merge/PR-ready work or after substantial edits.

Skill policy:
- Skills are instructions, not decoration. Read and follow them before acting.
- Use the smallest useful skill set.
- State activated skills once, terse.
- Do not let skill ritual slow execution.

---

## Workflow

1. **Activate:** Load required skills. State `Skills: x, y, z.`
2. **Ground:** Inspect repo facts first. Read entrypoints, configs, scripts, env templates, and relevant call sites.
3. **Decide:** Classify task as audit, bugfix, feature, frontend, backend, env/deploy, docs, or release.
4. **Plan lightly:** For simple tasks, proceed. For risky or multi-file work, give a short plan before edits.
5. **Execute scoped:** Change only files needed. Preserve existing patterns. No broad rewrites unless asked.
6. **Review:** Self-review. Add security review for sensitive areas.
7. **Verify:** Run narrow checks first, broader checks when changed behavior crosses app boundaries.
8. **Report:** Terse final: changed behavior/files, verification, blockers.

Quality gates:
- No Phase 3 feature work before Phase 2 hardening blockers are resolved or explicitly deferred.
- No "done" claim without verification evidence.
- Codebase truth beats docs and assumptions.
- No stubs that look production-ready but cannot run.

---

## Behavior & Efficiency

Caveman output:
- Short, direct, technical.
- Kill filler, apology, praise, and long explanation unless needed.
- Prefer bullets, compact tables, exact file refs.
- Ask only blocking questions. If a safe assumption exists, state it and continue.

Tooling:
- Use `rg` first for file/text search.
- Avoid recursive PowerShell scans over `node_modules`, `.next`, `.medusa`, `.vercel`, `.git`, and build outputs.
- Ignore generated/dependency folders unless the user explicitly asks.
- If `rg` fails, report exact command/error and use a scoped fallback.

Execution:
- Start immediately after skill activation.
- Explore before editing.
- Prefer small reversible patches.
- Keep scope tight.
- If blocked by env, network, credentials, sandbox, or external service, report exact blocker and best next action.

---

## Project Commands

Root:
- `corepack pnpm install`
- `corepack pnpm dev:storefront`
- `corepack pnpm build:storefront`
- `corepack pnpm lint:storefront`
- `corepack pnpm typecheck:storefront`
- `corepack pnpm dev:backend`
- `corepack pnpm build:backend`

Backend:
- `corepack pnpm --filter @allpencils/backend dev`
- `corepack pnpm --filter @allpencils/backend build`
- `corepack pnpm --filter @allpencils/backend db:migrate`
- `corepack pnpm --filter @allpencils/backend seed`
- `corepack pnpm --filter @allpencils/backend test:integration:http`
- `corepack pnpm --filter @allpencils/backend test:integration:modules`
- `corepack pnpm --filter @allpencils/backend test:unit`

Storefront:
- `corepack pnpm --filter @allpencils/storefront dev`
- `corepack pnpm --filter @allpencils/storefront build`
- `corepack pnpm --filter @allpencils/storefront lint`
- `corepack pnpm --filter @allpencils/storefront typecheck`

Verification defaults:
- Storefront-only change: lint + typecheck. Build for route/data/env changes.
- Backend-only change: backend build. Run targeted Medusa script/test when affected.
- Env/deploy change: verify storefront `/status`, backend `/health`, and relevant build.
- Cross-app change: run both app checks where practical.
- Docs-only change: inspect `git diff -- AGENTS.md docs`, run stale-claim searches, no app build unless docs affect generated artifacts.

Backend integration tests:
- Require disposable Postgres configured through `apps/backend/.env.test`.
- Do not run integration tests against production or shared data.
- If `.env.test` or test database is missing, report exact blocker.

---

## Architecture & File Map

Workspace:
- `apps/storefront`: Next.js App Router storefront.
- `apps/backend`: Medusa v2 backend.
- `docs`: product, phase, MVP, and prompt source docs.

Storefront:
- `apps/storefront/src/app`: routes and layouts.
- `apps/storefront/src/components`: reusable UI and commerce components.
- `apps/storefront/src/components/ui`: shadcn/radix UI primitives.
- `apps/storefront/src/lib/medusa`: only allowed Medusa Store API service layer.
- `apps/storefront/src/lib/medusa/cart.ts`: cart, shipping, payment-session, completion helpers.
- `apps/storefront/src/app/globals.css`: design tokens and Tailwind base styles.

Backend:
- `apps/backend/medusa-config.ts`: Medusa runtime config.
- `apps/backend/src/lib/env.ts`: backend env validation.
- `apps/backend/src/scripts/seed.ts`: demo catalog, region, shipping, inventory, publishable key seed.
- `apps/backend/src/scripts/create-admin.ts`: admin user helper.
- `apps/backend/src/api`: custom Medusa routes.
- `apps/backend/integration-tests`: Medusa test setup.

Environment:
- `.env.example`: shared env contract.
- `apps/backend/.env.template`: backend local template.
- `apps/backend/.env.test`: local disposable test DB env; never commit real secrets.
- `apps/backend/.env`: local backend secrets; never commit.
- `apps/storefront/.env.local`: local storefront env; never commit.

Data flow:
- Shopper route/component -> `apps/storefront/src/lib/medusa/*` -> Medusa Store API -> backend services -> PostgreSQL.
- Cart state is browser-side and mediated through the cart provider/service helpers.
- Checkout uses provider data returned from Medusa or env-configured provider names/IDs.

Deployment surfaces:
- Vercel storefront env: backend URL and publishable Store API key.
- Render backend env: database, JWT/cookie secrets, CORS, Stripe/Medusa provider settings when used.
- Neon database: production/staging Postgres.

---

## Git Hygiene

- Run `git status --short` before edits and before final response.
- Never revert user changes unless explicitly asked.
- Never use destructive git commands unless explicitly approved.
- Keep unrelated dirty files untouched.
- Use branch prefix `codex/` for new branches unless user asks otherwise.
- Do not amend commits unless explicitly requested.
- Do not commit secrets, `.env`, `.env.local`, generated build output, or dependency folders.
- If a generated tracked file changes unexpectedly, stop and inspect.

---

## Security & Environment

- Treat env values, publishable keys, tokens, database URLs, JWT secrets, cookie secrets, admin passwords, and payment config as sensitive.
- Never print secret values in final responses.
- If a secret exists, report path/type only.
- Do not hardcode credentials in source, scripts, tests, docs, or examples.
- If adding env vars, update `.env.example` with placeholder and one-line purpose.
- Require strong random `JWT_SECRET`, `COOKIE_SECRET`, and admin bootstrap passwords.
- Do not use Medusa default secret fallback in production/non-test runtime.
- Do not enable live payment processing unless explicitly instructed.
- Storefront may use `MEDUSA_PUBLISHABLE_KEY`, but must not log it.
- Seed scripts must not log publishable key/token values.
- If `REDIS_URL` is absent locally, Medusa may use a fake/in-memory fallback. That is not production-ready.

---

## Frontend Rules

- Preserve established visual language unless user asks for redesign.
- Use `next/image` for all rendered images.
- Use server components by default. Add `"use client"` only for browser state, effects, localStorage, or event handlers.
- Keep components accessible: labels, meaningful button/link text, keyboard-safe controls, visible focus states.
- Handle loading, empty, not-configured, and error states for async flows.
- Keep Medusa API calls inside `apps/storefront/src/lib/medusa`.
- Avoid new dependencies.
- Do not expose phase/internal demo copy in shopper-facing UI once Phase 2 hardening starts.
- Do not collect raw card number, expiry, or CVC.
- After multi-component TSX edits, run a React/frontend review pass.

---

## Backend & Medusa Rules

- Keep Medusa config env-driven.
- Run migrations and seed only against intended database.
- Seed must be idempotent and repair partial prior runs.
- Seed must not duplicate regions, tax regions, stock locations, fulfillment sets, shipping options, API key links, categories, products, or inventory on rerun.
- Keep inventory realistic for demos.
- Avoid logging secrets.
- Prefer Medusa workflows/services over raw database access.
- Keep custom API routes minimal and authenticated/authorized when not public storefront endpoints.

---

## Final Response Contract

- Terse and evidence-based.
- Mention changed files only when useful.
- Include verification commands and results.
- Include unresolved risks/blockers.
- Do not claim success if checks failed, were skipped, or blocked.
- If user asks for file content only, output only that content.

</INSTRUCTIONS>

