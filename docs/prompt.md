# AllPencils Agent Prompt Source

Read `AGENTS.md` first. It is the source of truth for current rules and workflow.

## Mission Context

You are working on AllPencils, a reusable ecommerce storefront template demoed as a pencil shop.

Current stage: **Phase 4 - visual polish and production readiness**.

Phase 2 cart and no-card checkout hardening is verified complete. Phase 3 homepage, recommendations, and scripted assistant are implemented. Next work is polish and production readiness unless the user asks for a new feature.

## Current Code Truth

Verified in `C:\Users\saqla\Documents\ecommerce-website`:

- Product list and detail routes fetch through `apps/storefront/src/lib/medusa`.
- Product routes use ISR with a 60-second revalidation window.
- Cart exists and supports add, quantity update, remove, and persistence.
- Checkout address/contact flow exists.
- No-card order completion flow exists.
- Order confirmation route exists.
- Homepage no longer exports the bootstrap page; it is implemented in `apps/storefront/src/app/page.tsx`.
- Homepage content lives in `apps/storefront/src/data/homepage.ts`.
- Scripted assistant content lives in `apps/storefront/src/data/assistant-script.ts`.
- Rule-based recommendation helpers live in `apps/storefront/src/lib/recommendations.ts`.
- Product detail pages include related product recommendations.
- Live Store API smoke test completed product -> cart -> address -> shipping option -> enabled payment provider -> order, with no card fields submitted.
- Backend HTTP integration test passed against disposable local Docker Postgres.
- `apps/backend/.env.test` is local/ignored and must not be committed or printed.

## Hard Rules

- No hardcoded secrets, deploy URLs, API URLs, tokens, passwords, or keys.
- Demo seed catalogue constants are allowed only in seed/data files.
- Medusa API calls stay inside `apps/storefront/src/lib/medusa`.
- Components must not call Medusa endpoints directly.
- Use `next/image` for rendered images.
- No raw card number, expiry, or CVC collection.
- No new dependencies without approval.
- No secrets in output.
- Do not run integration tests against production or shared data.

## Verification Already Run

- `git status --short`
- `corepack pnpm --filter @allpencils/storefront lint` - passed
- `corepack pnpm --filter @allpencils/storefront typecheck` - passed
- `corepack pnpm --filter @allpencils/storefront build` - passed
- `corepack pnpm --filter @allpencils/backend build` - passed; local build used fake Redis because `REDIS_URL` was absent
- `corepack pnpm --filter @allpencils/backend test:integration:http` - passed against disposable local Docker Postgres
- Live no-card checkout smoke test against the Render Medusa backend - passed after Render cold start
- Storefront rebuild design is documented in `docs/superpowers/specs/2026-05-09-storefront-rebuild-design.md`.
- Phase 3 homepage/recommendation/assistant implementation was browser-smoked locally on desktop and mobile screenshots.

## Next Developer-Agent Prompt

```text
Start at repo root: C:\Users\saqla\Documents\ecommerce-website. Read AGENTS.md first and follow it strictly.

Mission: start Phase 4 polish and production readiness for the implemented storefront homepage, recommendations, and scripted assistant. Do not add new features unless explicitly approved.

Scope:
1. Preserve existing dirty work; do not revert user changes.
2. Review the implemented homepage, recommendation rails, product detail recommendations, and scripted assistant.
3. Polish responsive layout, accessibility, copy, and empty/error states without changing checkout behavior.
4. Keep Medusa API calls inside `apps/storefront/src/lib/medusa`.
5. Keep simulated AI local/static/rule-based; do not add real AI API calls.
6. Use the approved design in `docs/superpowers/specs/2026-05-09-storefront-rebuild-design.md`.
7. Keep GSAP, Framer Motion, Three.js, Spline, and Google Font changes behind explicit approval if they could affect build/runtime stability.
8. Run:
   - git status --short
   - corepack pnpm --filter @allpencils/storefront lint
   - corepack pnpm --filter @allpencils/storefront typecheck
   - corepack pnpm --filter @allpencils/storefront build
9. Browser-check desktop and mobile core routes where possible.
10. Report changed files, verification, and any blockers.

No new dependencies without asking. No real AI API calls. No secrets in output.
```
