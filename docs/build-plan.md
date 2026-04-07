# AllPencils — Phased Build Plan

---

## Phase 0 — Environment Setup

**Goal:** All tools installed and a working blank storefront is deployed to Vercel with a Medusa backend deployed to Render and PostgreSQL provided by Neon.

**What gets built:**

- Node.js, pnpm, and Medusa CLI installed locally
- Medusa v2 backend initialised, connected to a Neon PostgreSQL instance, and deployed to Render
- Next.js 14 (TypeScript, App Router, Tailwind, shadcn/ui) project scaffolded and deployed to Vercel
- Environment variables configured in Render and Vercel, using the Neon database connection string
- Frontend successfully fetches from the Medusa API (confirm with a `/health` check rendered on a test page)

**Hosting note:** If zero paid hosting is required, keep the storefront on Vercel, host the Medusa application on Render, and use Neon for PostgreSQL. Do not switch this stack to a fully Vercel-only or Netlify-only deployment unless the backend architecture changes away from self-hosted Medusa.

**Free-tier caveat:** Render Free is acceptable for a prototype, but it can sleep after inactivity and introduce cold starts. Neon Free and Vercel Hobby are also hobby-grade tiers. This stack is suitable for a zero-cost prototype, not a long-term client-facing production deployment.

**Done criteria:**

- `https://your-app.vercel.app` returns a working Next.js page
- `https://your-backend.onrender.com/health` returns `{ "status": "ok" }`
- No hardcoded URLs or keys anywhere in source code

**Deferred:** All product data, UI, and features

---

## Phase 1 — Seeded Catalogue & Product Pages

**Goal:** A real product catalogue is browsable end-to-end.

**What gets built:**

- Seed script populates Medusa with 6–8 products (title, description, price, image URL, category tag)
- `/products` catalogue page: responsive grid of product cards (image, name, price)
- `/products/[handle]` detail page: full image, description, price, variant selector, Add to Cart button (non-functional placeholder)
- `next/image` used on all images; ISR configured with a 60-second revalidation window
- Basic site layout: header (logo, cart icon), footer

**Done criteria:**

- All seeded products visible at `/products`
- Each product detail page renders correctly with no layout shift
- Lighthouse mobile score ≥ 90 on at least one product page
- No raw `<img>` tags in the codebase

**Deferred:** Cart logic, checkout, AI features, homepage hero

---

## Phase 2 — Cart & Simulated Checkout

**Goal:** A user can add items to a cart and complete a fake purchase.

**What gets built:**

- Medusa cart API integration: create cart, add line items, update quantities, remove items
- Cart drawer or `/cart` page showing line items, quantities, and subtotal
- Stripe test mode integrated via Medusa's Stripe plugin — no live keys
- `/checkout` page: name, email, address form + Stripe test card element
- Order confirmation screen with mock order number on successful charge
- Cart item count badge in the header, updated in real time

**Done criteria:**

- Full checkout flow completes with test card `4242 4242 4242 4242`
- Confirmation screen shows and no real charge is made
- Cart state persists across page navigation within the session

**Deferred:** User accounts, email confirmation, real payment gateway

---

## Phase 3 — Homepage & Simulated AI Features

**Goal:** The storefront looks complete and the AI features are visible and functional.

**What gets built:**

- Homepage: hero section with headline, subheadline, and CTA; featured products strip; "AI Picks" recommendation row
- Recommendation logic: a server-side function in `/lib/recommendations.ts` returns related products based on category tag matching; labelled as "Recommended for you" in the UI
- Shopping assistant widget: fixed-position chat button, opens a chat panel, responses driven by `/data/assistant-script.json`; fallback response for unrecognised input
- "You might also like" row on each product detail page using the same recommendation function

**Done criteria:**

- All 6 MVP core loop steps complete without error
- Assistant has ≥5 working scripted exchanges and a graceful fallback
- "AI Picks" strip visible on homepage with at least 3 products
- No AI API calls in the codebase — everything is rule-based or scripted

**Deferred:** Real LLM integration, personalisation based on user history

---

## Phase 4 — Polish & Demo Readiness

**Goal:** The site is presentable to a client with no rough edges.

**What gets built:**

- Responsive layout review across mobile, tablet, and desktop
- Loading states and error states for all async data fetches
- Smooth page transitions and cart animations
- Final Lighthouse audit — fix any remaining Core Web Vitals issues
- Clean public Vercel URL confirmed, all environment variables verified in production
- Brief Medusa Admin walkthrough prepared (show product management UI)

**Done criteria:**

- Full demo readiness checklist in `docs/mvp.md` ticked off
- Lighthouse mobile score ≥ 90 on homepage and one product detail page
- Zero console errors on any page in the core loop
- Site accessible at a shareable public URL

**Deferred:** Domain name, SEO metadata beyond basics, admin panel refinement
