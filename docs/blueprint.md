# AllPencils Blueprint

## Product

AllPencils is a reusable ecommerce storefront template, currently demoed as a pencil shop. It should prove that a client can get a polished storefront backed by Medusa, then swap catalogue and branding later.

Current build stage: **Phase 2 hardening - cart and no-card simulated checkout**.

## Architecture

| Area | Current choice |
| --- | --- |
| Storefront | Next.js 14 App Router, TypeScript |
| Styling | Tailwind CSS and shadcn/ui |
| Backend | Medusa.js v2 |
| Database | PostgreSQL, Neon for hosted environments |
| Frontend hosting | Vercel |
| Backend hosting | Render |
| Checkout | No-card simulated checkout using Medusa provider data |
| AI | Planned simulated features only |

Hosting is split by design:
- Vercel runs the storefront.
- Render runs the Medusa backend.
- Neon stores backend data.

Do not propose a different hosting topology unless the user asks to change architecture.

## Storefront Boundaries

Components must not call Medusa endpoints directly.

Allowed flow:

```text
route/component -> apps/storefront/src/lib/medusa/* -> Medusa Store API -> backend -> PostgreSQL
```

Important files:
- `apps/storefront/src/app` - App Router routes.
- `apps/storefront/src/components` - reusable UI and commerce components.
- `apps/storefront/src/lib/medusa` - Medusa service layer.
- `apps/storefront/src/lib/medusa/cart.ts` - cart, shipping, payment, completion helpers.
- `apps/storefront/src/app/globals.css` - global design tokens and Tailwind base.

## Backend Boundaries

Important files:
- `apps/backend/medusa-config.ts` - Medusa runtime config.
- `apps/backend/src/lib/env.ts` - backend env validation.
- `apps/backend/src/scripts/seed.ts` - demo seed data and inventory.
- `apps/backend/src/scripts/create-admin.ts` - admin bootstrap helper.
- `apps/backend/src/api` - custom backend routes.
- `apps/backend/integration-tests` - backend tests.

Use Medusa workflows/services where practical. Avoid raw database access unless there is a clear reason.

## Environment Surfaces

Shared:
- `.env.example` documents placeholders only.

Storefront:
- `apps/storefront/.env.local` for local runtime values.
- Vercel dashboard for hosted values.

Backend:
- `apps/backend/.env.template` for local placeholders.
- `apps/backend/.env` for local secrets.
- `apps/backend/.env.test` for disposable test database values.
- Render dashboard for hosted values.

Rules:
- No secrets in source or docs.
- No committed real `.env`, `.env.local`, or `.env.test`.
- No hardcoded deploy URLs in source.
- Production/non-test backend runtime must not use placeholder/default JWT or cookie secrets.
- `REDIS_URL` absence can mean local fake Redis fallback. That is not production-ready.

## Current Phase Truth

Implemented or done-ish:
- Product list route.
- Product detail route.
- ISR for product/catalogue routes.
- Anonymous cart.
- Quantity updates.
- Checkout address/contact form.
- No-card checkout.
- Order confirmation.

Not implemented:
- Final homepage.
- Simulated recommendation feature.
- Scripted assistant feature.
- Full visual polish pass.
- Full production verification record.

Known shopper-facing cleanup:
- Remove phase/internal demo copy from routes and components.
- Keep checkout clear that it is no-card simulated checkout without collecting sensitive card data.

## Checkout Contract

Current checkout is not a card payment UI.

Must:
- Use Medusa shipping/payment provider data or env-configured provider values.
- Fail clearly when required provider data is unavailable.
- Avoid raw card number, expiry, and CVC fields.
- Avoid logging provider secrets, token values, or publishable key values.

Must not:
- Add fake card inputs.
- Claim live payment readiness.
- Enable live Stripe keys without explicit instruction.

## Seed Contract

Seed scripts may contain demo catalogue constants because they are data setup files.

Seed must:
- Be idempotent.
- Repair partial prior runs where practical.
- Avoid duplicate regions, tax regions, stock locations, fulfillment sets, shipping options, API key links, categories, products, and inventory.
- Avoid logging publishable key/token values.
- Be run only against the intended database.

## Planned Phase 3

Phase 3 starts only after Phase 2 hardening passes or blockers are explicitly deferred.

Planned work:
- Final homepage.
- Simulated recommendations.
- Scripted assistant.

Constraints:
- No real AI APIs.
- Recommendation logic must be local and deterministic.
- Assistant copy must live in data/config, not component literals.
- New modules/files should be created only when implementing the features.

## Verification Defaults

Storefront-only:

```powershell
corepack pnpm --filter @allpencils/storefront lint
corepack pnpm --filter @allpencils/storefront typecheck
```

Run storefront build when route/data/env behavior changes:

```powershell
corepack pnpm --filter @allpencils/storefront build
```

Backend-only:

```powershell
corepack pnpm --filter @allpencils/backend build
```

Backend integration HTTP:

```powershell
corepack pnpm --filter @allpencils/backend test:integration:http
```

If integration tests are blocked, report exact `.env.test` or disposable Postgres blocker.

Docs-only:

```powershell
git diff -- AGENTS.md docs
```

Then run stale-claim and mojibake searches requested by the active task. Treat historical phase headings differently from stale "current phase" claims.
