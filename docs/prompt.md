# AllPencils Agent Prompt Source

Read `AGENTS.md` first. It is the source of truth for current rules and workflow.

## Mission Context

You are working on AllPencils, a reusable ecommerce storefront template demoed as a pencil shop.

Current stage: **Phase 3 - homepage, simulated recommendations, scripted assistant**.

Phase 2 cart and no-card checkout hardening is verified complete. Phase 3 may start, but must stay simulated/local: no real AI API calls.

## Current Code Truth

Verified in `C:\Users\saqla\Documents\ecommerce-website`:

- Product list and detail routes fetch through `apps/storefront/src/lib/medusa`.
- Product routes use ISR with a 60-second revalidation window.
- Cart exists and supports add, quantity update, remove, and persistence.
- Checkout address/contact flow exists.
- No-card order completion flow exists.
- Order confirmation route exists.
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

## Next Developer-Agent Prompt

```text
Start at repo root: C:\Users\saqla\Documents\ecommerce-website. Read AGENTS.md first and follow it strictly.

Mission: start Phase 3 by building the final storefront homepage, deterministic simulated recommendations, and a scripted shopping assistant. Do not add real AI API calls.

Scope:
1. Preserve existing dirty work; do not revert user changes.
2. Replace the bootstrap homepage with a polished reusable storefront homepage.
3. Add deterministic simulated recommendations using local/static/rule-based logic only.
4. Add a scripted/static shopping assistant without external AI calls.
5. Keep Medusa API calls inside `apps/storefront/src/lib/medusa`.
6. Keep simulated AI copy/data outside components where practical.
7. Run:
   - git status --short
   - corepack pnpm --filter @allpencils/storefront lint
   - corepack pnpm --filter @allpencils/storefront typecheck
   - corepack pnpm --filter @allpencils/storefront build
8. Report changed files, verification, and any blockers.

No new dependencies without asking. No real AI API calls. No secrets in output.
```
