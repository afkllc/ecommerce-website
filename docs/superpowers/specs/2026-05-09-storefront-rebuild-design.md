# Storefront Rebuild Design

Date: 2026-05-09

## Goal

Rebuild the AllPencils storefront UI as a reusable Tailwind CSS and shadcn/ui template system while preserving the verified Medusa product, cart, checkout, and no-card order flow.

The demo remains a specialist pencil shop, but the implementation should be easy to reuse for other ecommerce clients.

## Direction

Use the A+C visual direction refined into A+B:

- Premium storefront first impression.
- Use-case-led shopping: Artist, School, Work.
- Product-craft credibility: graphite grade, pigment, comfort, durability.
- Guided commerce layer through deterministic recommendations and a scripted assistant.

Avoid gift-shop positioning. The store should feel useful for artists, students, and focused work buyers.

## Scope

Phase 3 includes:

- Replace the bootstrap homepage with a polished reusable storefront homepage.
- Add deterministic simulated recommendations.
- Add a scripted/static shopping assistant.
- Add product detail recommendations.
- Add light UI motion where it does not require new dependencies.
- Introduce Google Fonts through `next/font/google` if the chosen fonts improve the template.

Phase 3 excludes:

- Real AI API calls.
- Cart or checkout redesign.
- Live payment collection.
- New dependencies without explicit approval.
- Heavy GSAP timelines.
- Spline or Three.js 3D hero work.

## Homepage Experience

The homepage should assemble reusable sections in this order:

1. Premium hero: specialist pencils for sketching, study, and focused work.
2. Use-case cards: Artist, School, Work.
3. Featured live products from the Medusa catalogue.
4. Product craft strip: graphite grade, pigment, comfort, durability.
5. Simulated recommendations.
6. Scripted assistant teaser or widget entry point.

The homepage should feel like a real storefront, not a phase page, internal demo, or AI product landing page.

## Product Detail Experience

Keep the existing product detail flow intact:

- Product data still loads through `apps/storefront/src/lib/medusa`.
- Add-to-cart and variant selection behavior remain unchanged.
- Add a `You might also like` recommendation rail below the main detail content.
- Recommendations should be deterministic and should not touch cart or checkout logic.

## Component Architecture

Use a restrained template system:

```text
apps/storefront/src/components/storefront/
  sections/
    hero-section.tsx
    use-case-grid.tsx
    featured-product-rail.tsx
    craft-strip.tsx
    assistant-teaser.tsx
  recommendations/
    recommendation-rail.tsx
    recommendation-card.tsx
  assistant/
    shopping-assistant.tsx

apps/storefront/src/data/
  homepage.ts
  assistant-script.ts

apps/storefront/src/lib/
  recommendations.ts
```

Page files should assemble sections and pass config. They should not contain large copy blocks or direct Medusa calls.

## Data Flow

Homepage:

```text
app/page.tsx
  -> homepage config from src/data/homepage.ts
  -> product data from src/lib/medusa
  -> recommendations from src/lib/recommendations.ts
  -> storefront section components
```

Product detail:

```text
app/products/[handle]/page.tsx
  -> product data from src/lib/medusa
  -> catalogue/product context into src/lib/recommendations.ts
  -> recommendation rail component
```

Assistant:

```text
assistant component
  -> scripted prompts/responses from src/data/assistant-script.ts
  -> local state only
  -> no network AI calls
```

## Recommendation Rules

Recommendations should be deterministic:

- Prefer matching product metadata or category/use-case hints when available.
- Prefer same use case when viewing a product detail page.
- Fall back to catalogue order when metadata is sparse.
- Never fabricate unavailable products.
- Never call external APIs.

## Assistant Rules

The assistant is scripted, not AI:

- Use static prompt/response data.
- Guide shoppers by intent: artist, school, work.
- Link or point toward relevant products/use cases when possible.
- Provide graceful fallback copy for unknown input.
- Keep assistant copy outside components where practical.

## Visual Style

Target:

- Premium but practical.
- Specialist stationery store, not AI startup.
- Clean neutral base with restrained accent colors.
- Real product imagery or product-led layouts.
- Compact ecommerce sections.
- No abstract gradient blobs, orbs, or decorative bokeh.
- Clear CTAs: `Shop pencils` and `Find your fit`.

Use shadcn/ui primitives and Tailwind utilities. Use lucide icons for controls and use-case cards where helpful.

## Motion And 3D Plan

Phase 3 motion:

- Light section reveal.
- Product card hover/tap polish.
- Assistant open/close transition.
- Use CSS/Tailwind first unless a dependency is approved.

Phase 4 motion and 3D:

- Framer Motion as default UI animation layer if approved.
- GSAP only for complex timelines or scroll-linked sequences if approved.
- Spline for art-directed hero 3D object if approved.
- Three.js for custom interactive 3D if approved.
- Do not animate the same element with both Framer Motion and GSAP.
- Do not mix Spline and Three.js in the first 3D pass unless there is a clear need.

## Typography

Use `next/font/google` for Google Fonts if typography changes are included.

Use at most:

- One display font for headings.
- One body font for product and UI text.

No external font package is needed.

## Testing

Required checks after implementation:

- `git status --short`
- `corepack pnpm --filter @allpencils/storefront lint`
- `corepack pnpm --filter @allpencils/storefront typecheck`
- `corepack pnpm --filter @allpencils/storefront build`

Browser verification should cover:

- Homepage desktop and mobile layout.
- Product detail page recommendation rail.
- Assistant open/close and scripted fallback.
- No console errors.

## Open Risks

- Product metadata may be too sparse for rich recommendations, so fallback rules must be solid.
- Additional animation/3D packages can bloat the template, so they stay Phase 4 unless approved.
- The existing dirty backend test file status appears to be line-ending noise; do not mix it into storefront rebuild work.
