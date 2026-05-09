# AllPencils Build Plan

This plan tracks the demo storefront as it exists today and the safest next work. Code truth wins over this document when they disagree.

Current stage: **Phase 4 - visual polish and production readiness**.

## Phase 0 - Foundation

Status: complete enough for current work.

Done:
- Monorepo layout with `apps/storefront` and `apps/backend`.
- Next.js storefront wired to Medusa through `apps/storefront/src/lib/medusa`.
- Medusa backend configured for PostgreSQL.
- Env templates exist for shared, backend, and storefront setup.
- Demo seed script exists.

Guardrails:
- No hardcoded secrets or deploy URLs.
- No direct Medusa calls from components.
- No new dependencies without approval.
- Keep `.env`, `.env.local`, and real `.env.test` secrets out of git.

## Catalogue Stage - Seeded Catalogue & Product Pages

Status: implemented, needs continued regression checks.

Done-ish:
- `/products` exists.
- `/products/[handle]` exists.
- Catalogue/detail fetches go through `apps/storefront/src/lib/medusa`.
- Product routes use ISR with a 60-second revalidation window.
- Product detail can add selected variants to cart.

Known hardening needs:
- Remove internal phase/demo copy from shopper-facing product UI.
- Confirm unavailable variant combinations cannot add the wrong variant.
- Confirm all product images render through `next/image`.

Done criteria:
- Product list loads from Medusa with a valid publishable key.
- Product detail loads by handle.
- Missing product handles return a proper not-found state.
- Empty catalogue and backend unavailable states are handled.
- Storefront lint, typecheck, and build pass.

## Phase 2 - Cart & No-Card Simulated Checkout

Status: verified complete on 2026-05-09.

Checkout truth:
- Current checkout is intentionally no-card.
- The checkout must not collect raw card number, expiry, or CVC.
- Shipping/payment provider selection must come from Medusa data or env-configured provider values.
- If shipping/payment provider data is unavailable, checkout must fail clearly.

Done-ish:
- Cart page exists.
- Cart provider exists.
- Quantity update/remove flows exist.
- Checkout contact/address form exists.
- Order confirmation page exists.
- Cart/checkout Store API work is centralized in `apps/storefront/src/lib/medusa/cart.ts`.

Verified:
- Live Store API smoke test completed product -> cart -> address -> shipping option -> enabled payment provider -> order without submitting card fields.
- Shopper-facing phase/internal copy was removed from main shopper routes/components.
- `corepack pnpm --filter @allpencils/storefront lint` passed.
- `corepack pnpm --filter @allpencils/storefront typecheck` passed.
- `corepack pnpm --filter @allpencils/storefront build` passed.
- `corepack pnpm --filter @allpencils/backend build` passed; local build used fake Redis because `REDIS_URL` was absent.
- `corepack pnpm --filter @allpencils/backend test:integration:http` passed against disposable local Docker Postgres.

Done criteria:
- Cart persists for an anonymous shopper.
- Add/remove/update quantity works.
- Checkout creates or updates the cart with email and shipping/billing address.
- Shipping option selection is data-driven or env-configured.
- Payment session/provider selection is data-driven or env-configured.
- Order confirmation can render completed order data.
- No raw card fields exist in UI or submitted payloads.

## Phase 3 - Homepage, Simulated Recommendations, Assistant

Status: implemented on 2026-05-09; keep regression checks running.

Current homepage truth:
- Homepage is implemented in `apps/storefront/src/app/page.tsx`.
- Homepage data lives in `apps/storefront/src/data/homepage.ts`.
- Scripted assistant data lives in `apps/storefront/src/data/assistant-script.ts`.
- Recommendation helpers live in `apps/storefront/src/lib/recommendations.ts`.
- Homepage product data still comes through `apps/storefront/src/lib/medusa`.
- Product detail pages include related product recommendations.

Done:
- Replaced bootstrap homepage with a reusable Tailwind CSS and shadcn/ui storefront homepage.
- Added rule-based recommendations for Artist, School, and Work use cases.
- Added product-detail related recommendations.
- Added a scripted/static shopping assistant with no external AI API calls.
- Kept simulated assistant/recommendation copy outside route components where practical.
- Kept Phase 3 motion light with existing CSS/Tailwind patterns only.

Guardrails:
- Add new data/script files only when implementing the feature.
- Do not hardcode assistant copy inside components.
- Keep Medusa data fetching inside the service layer.
- Use `next/font/google` for Google Fonts if typography changes are needed.
- Do not add Framer Motion, GSAP, Three.js, or Spline dependencies without explicit approval.

Done criteria:
- Homepage feels demo-ready and not like an internal build scaffold.
- Recommendations are deterministic and testable.
- Assistant copy is data-driven.
- Empty/error states exist.
- Frontend lint, typecheck, and build pass.

## Phase 4 - Visual Polish & Production Readiness

Status: next.

Scope:
- Responsive QA.
- Accessibility pass.
- Empty/loading/error states.
- Performance review.
- Image optimization.
- SEO/meta basics.
- Remove internal/demo-only UI language.
- Richer motion and 3D polish, if approved.
- Framer Motion for UI animation, GSAP for complex timelines, Spline for art-directed 3D, and Three.js for custom interactive 3D.

Out of scope unless explicitly requested:
- Live payments.
- Accounts/auth.
- Email.
- Discounts/promotions.
- Search.
- Multi-currency.
- Multi-language.

Done criteria:
- Storefront has no obvious placeholder/internal copy.
- Keyboard/focus behavior is acceptable.
- Mobile layout works on core routes.
- Product, cart, checkout, confirmation, and status routes are verified.
- Builds pass.

## Phase 5 - Handoff & Deploy Readiness

Status: future.

Scope:
- Document required env vars.
- Document local dev and hosted deployment.
- Verify Render backend health.
- Verify Vercel storefront status.
- Verify Neon DB assumptions.
- Record known cold-start/free-tier behavior if using free hosting.

Done criteria:
- `.env.example` and backend template are accurate placeholders only.
- No secrets committed.
- Admin bootstrap path is documented without committed credentials.
- Seed script reruns safely.
- Production env validation blocks placeholder/default secrets.
- Human owner knows which dashboard values must be configured.

## Current Next Prompt

```text
Start at repo root. Read AGENTS.md first and follow it strictly.

Mission: start Phase 4 polish and production readiness for the implemented storefront homepage, recommendations, and scripted assistant. Do not add new features unless explicitly approved.

Scope:
1. Preserve existing dirty work; do not revert user changes.
2. Review the implemented homepage, recommendation rails, product detail recommendations, and scripted assistant.
3. Polish responsive layout, accessibility, copy, and empty/error states without changing checkout behavior.
4. Keep Medusa API calls inside `apps/storefront/src/lib/medusa`.
5. Keep simulated AI local/static/rule-based; do not add real AI API calls.
6. Do not add GSAP, Framer Motion, Three.js, Spline, or new dependencies without explicit approval.
7. Run required checks:
   - git status --short
   - corepack pnpm --filter @allpencils/storefront lint
   - corepack pnpm --filter @allpencils/storefront typecheck
   - corepack pnpm --filter @allpencils/storefront build
8. Browser-check desktop and mobile core routes where possible.
9. Report changed files, verification, and any blockers.

No new dependencies without asking. No real AI API calls. No secrets in output.
```
