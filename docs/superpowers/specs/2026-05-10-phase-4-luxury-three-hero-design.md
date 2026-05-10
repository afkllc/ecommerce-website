# Phase 4 Luxury Three.js Hero Design

Date: 2026-05-10

## Goal

Turn the AllPencils storefront from a functional ecommerce skeleton into a memorable, sellable template demo.

The first screen should feel like a premium landing page that proves visual craft quickly, while the rest of the storefront remains practical ecommerce: product browsing, guided recommendations, cart, and no-card checkout.

## Approved Direction

Use a luxury atelier storefront direction:

- Warm, trustworthy base.
- Landing-page-grade hero.
- Procedural 3D pencil as the main visual object.
- Subtle warm studio gradient and depth.
- Sharp editorial controls instead of pill-style AI-looking buttons.
- Product-led ecommerce sections below the fold.

The user rejected generic pill buttons and generic AI-style visual language. The design must avoid purple gradients, over-soft rounded shapes, predictable SaaS composition, and generic "AI landing page" styling.

## Approved Dependencies

The user approved the richer Three.js path:

- `three`
- `@react-three/fiber`

`@react-three/drei` is intentionally not approved for this pass. The pencil is procedural geometry, so Drei is avoidable unless implementation proves a specific need and the user approves it later.

No GSAP, Framer Motion, Spline, Drei, or other new libraries are approved for this pass.

## Visual System

Tone:

- Luxury stationery atelier.
- Cinematic but restrained.
- Trustworthy enough for shoppers.
- Impressive enough for a buyer evaluating the template.

Palette:

- Dominant warm dark ink / umber.
- Warm paper and ivory text.
- Gold/graphite accent.
- One sharper accent for primary action, used sparingly.

Typography:

- Replace generic-feeling type if needed.
- Use at most one display font and one body font.
- Prefer distinctive editorial display typography for hero headings.
- Avoid generic Inter/Arial/Roboto-style output.
- Use `next/font/google` only if build remains stable.

Buttons and controls:

- Avoid pill-shaped CTAs.
- Use square, chamfered, or editorial button treatment.
- Primary CTA can use shadow, offset border, or tactile print-inspired detail.
- Secondary CTA can be text-link/editorial underline instead of another button.

Background:

- Use a subtle warm gradient with atmospheric lighting.
- No purple SaaS gradients.
- No decorative orbs or bokeh blobs.
- Background should support the 3D pencil, not compete with it.

## Homepage Structure

First viewport:

1. Site header integrated into the hero, not visually detached.
2. Hero copy that sells the store and the template quality.
3. Procedural Three.js pencil scene as the dominant visual.
4. Primary CTA: shop catalogue.
5. Secondary CTA: guided picks / assistant.
6. Hint of next content visible below the fold.

Below fold:

1. Use-case shopping cards: Artist, School, Work.
2. Featured live products from Medusa.
3. Product craft strip.
4. Deterministic recommendation rail.
5. Scripted assistant entry.

Cart and checkout layout/behavior stay out of scope for this pass unless a visual issue blocks the full experience.

## 3D Hero

Implement the hero pencil as a client-only Three.js scene using React Three Fiber.

Scene requirements:

- Procedural pencil geometry, not an external model dependency.
- Hexagonal or faceted body.
- Wood cone and graphite tip.
- Optional ferrule/eraser if it improves recognition without clutter.
- Warm studio lighting.
- Soft shadows or contact depth where practical.
- Slow idle rotation.
- Subtle pointer parallax.
- Respect reduced motion by disabling or minimizing animation.
- Nonblank fallback if WebGL/canvas fails.

The 3D object should be the product signal. It must not be a tiny decorative preview inside a card.

## Component Architecture

Expected new or changed frontend files:

```text
apps/storefront/src/components/storefront/hero/
  luxury-hero.tsx
  pencil-scene.tsx
  pencil-model.tsx
  hero-fallback.tsx

apps/storefront/src/components/storefront/sections/
  use-case-grid.tsx
  featured-product-rail.tsx
  craft-strip.tsx
  assistant-teaser.tsx

apps/storefront/src/app/
  page.tsx
  globals.css
  layout.tsx, only if typography changes are included
```

Keep Medusa calls in `apps/storefront/src/lib/medusa`. Page files may fetch data through the service layer and pass it into visual components.

## Data Flow

Homepage data remains:

```text
app/page.tsx
  -> src/data/homepage.ts
  -> src/lib/medusa
  -> src/lib/recommendations.ts
  -> visual sections
```

The 3D scene receives no Medusa data and makes no network calls.

## Accessibility

- Hero text must remain real HTML text, not canvas text.
- CTA links must be keyboard reachable.
- Canvas must have an accessible label or be marked decorative with equivalent visible product text.
- Respect `prefers-reduced-motion`.
- Maintain visible focus states.
- Do not hide important ecommerce actions inside the 3D scene.

## Performance

- Load the 3D hero client-side with a clear fallback.
- Avoid blocking product data or route rendering on the 3D scene.
- Keep geometry simple and procedural.
- Do not ship heavy external model files in this pass.
- Verify production build size after adding dependencies.
- Keep all Three.js code inside a client-only dynamic import boundary.
- Do not import Three.js code into server components.

## Testing

Required checks:

- `git status --short`
- `corepack pnpm --filter @allpencils/storefront lint`
- `corepack pnpm --filter @allpencils/storefront typecheck`
- `corepack pnpm --filter @allpencils/storefront build`

Browser verification:

- Homepage desktop.
- Homepage mobile.
- Canvas is nonblank.
- 3D pencil is visible and framed.
- Reduced-motion path does not feel broken.
- Product list still loads.
- Product detail recommendations still render.
- Cart and checkout still accessible.
- No console errors.

Performance verification:

- The 3D hero must render fallback content before the canvas paints.
- The scene must be skipped for `prefers-reduced-motion: reduce`.
- Pointer parallax applies only on pointer/fine devices.
- Mobile hero must not hide the next ecommerce section completely.
- Build output must be reviewed for obvious bundle growth.

## Out Of Scope

- Spline embed.
- Real AI calls.
- Cart or checkout behavior changes.
- Live payment fields.
- New backend work.
- GSAP or Framer Motion.
- `@react-three/drei` unless a later plan names a specific required feature and gets approval.
- External 3D model marketplace files.

## Risks

- Three.js dependencies add bundle weight.
- WebGL can fail on some machines, so fallback matters.
- Over-designing the hero could bury ecommerce clarity.
- Google Fonts can affect local build stability if network/font fetch fails.
- Current `AGENTS.md` may be stale compared with `docs/prompt.md`; code truth and explicit user direction should guide this Phase 4 spec.
