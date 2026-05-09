# AllPencils MVP

AllPencils is a demo-ready ecommerce storefront template using a pencil shop as sample content. It should feel professional, fast, and generic enough for a future client to rebrand.

Current stage: **Phase 2 hardening - cart and no-card simulated checkout**.

## MVP Goal

Show a complete shopper path without pretending unfinished systems are production-ready:

1. Shopper lands on storefront.
2. Shopper browses products.
3. Shopper opens product detail.
4. Shopper selects an available variant and adds it to cart.
5. Shopper edits cart quantity or removes items.
6. Shopper enters contact and address details.
7. Shopper completes no-card checkout through Medusa provider data.
8. Shopper sees order confirmation.

Current homepage is still a bootstrap route. Final homepage, simulated recommendations, and scripted assistant are future Phase 3 work.

## Users

Primary:
- Shopper browsing and purchasing products.

Secondary:
- Store owner using Medusa Admin after handoff.

Developer buyer:
- Evaluates the repo as a reusable ecommerce template.

## Current MVP Surface

Implemented or done-ish:
- Product listing route.
- Product detail route.
- Anonymous cart.
- Quantity updates.
- Checkout address/contact form.
- No-card simulated checkout.
- Order confirmation route.
- Medusa Store API abstraction in `apps/storefront/src/lib/medusa`.
- Cart/checkout helpers in `apps/storefront/src/lib/medusa/cart.ts`.
- ISR on catalogue/product routes.

Not implemented yet:
- Final homepage.
- Simulated recommendations.
- Scripted shopping assistant.
- Visual polish pass.
- Full production verification record.

## Checkout Position

Current checkout must stay no-card until Stripe Elements or another secure provider UI is actually implemented.

Rules:
- Do not collect raw card number, expiry, or CVC.
- Do not add fake card inputs for demo polish.
- Use Medusa shipping/payment provider data or env-configured provider values.
- Fail clearly when provider data is missing.
- Never print payment provider secrets or token values.

## AI Position

AI features are planned demo simulations, not current code.

Rules:
- No external AI API calls.
- Simulated recommendations must be deterministic and rule-based when added.
- Assistant copy must be data-driven when added.
- Do not hardcode assistant dialogue inside components.
- Do not document planned modules as existing code.

## Acceptance Criteria For Phase 2

Phase 2 can be marked complete only when:

- Product list/detail still work through the service layer.
- Product list/detail ISR behavior is preserved.
- Cart add/update/remove works.
- Checkout completes without raw card fields.
- Shipping/payment provider selection is data-driven or env-configured.
- Provider unavailable states fail clearly.
- Order confirmation renders useful order data.
- Shopper-facing routes do not expose internal phase/build-plan copy.
- Storefront lint passes.
- Storefront typecheck passes.
- Storefront build passes.
- Backend build passes.
- Backend integration HTTP test passes, or exact `.env.test`/Postgres blocker is documented.
- Live checkout smoke test is recorded without secrets.

## Non-Goals

Do not build unless explicitly requested:
- Live payment processing.
- Accounts.
- Email notifications.
- Discounts/promotions.
- Search.
- Multi-currency.
- Multi-language.
- Mobile app.
- PWA.
- Shopify integration.
- Real AI calls.

## Demo Quality Bar

The MVP should:
- Load quickly.
- Have clear empty/error states.
- Avoid internal or phase labels in shopper-facing UI.
- Use accessible labels and keyboard-safe controls.
- Use `next/image` for rendered images.
- Avoid hardcoded deploy URLs.
- Avoid secrets in code, docs, logs, and output.
- Be clear about local-only fallback behavior such as fake Redis when `REDIS_URL` is absent.

## Required Verification Before Feature Work

Run:

```powershell
git status --short
corepack pnpm --filter @allpencils/storefront lint
corepack pnpm --filter @allpencils/storefront typecheck
corepack pnpm --filter @allpencils/storefront build
corepack pnpm --filter @allpencils/backend build
corepack pnpm --filter @allpencils/backend test:integration:http
```

If the integration test is blocked, report the exact missing `.env.test` or disposable Postgres requirement. Do not use production data for tests.
