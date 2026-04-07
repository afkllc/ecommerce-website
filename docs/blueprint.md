# AllPencils — Blueprint

> Stable reference document. Update only when a foundational decision changes.

---

## 1. Product Vision

AllPencils is a reusable ecommerce storefront template, demoed as a pencil shop, designed to be sold to clients who want a fast, SEO-optimised, professionally designed online store. The product's value proposition to clients is threefold: it looks premium, it loads fast enough to rank well on Google, and it can be handed off with a working admin panel so the client manages their own catalogue.

The current build is a **clickable prototype** aimed at winning a paying client. The underlying architecture is real, not throwaway — every decision made here should hold as the product evolves into a full-production template.

---

## 2. Architecture Decisions

### Frontend

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui component library
- **Hosting:** Vercel

Next.js is the correct choice here for three reasons: it renders pages server-side by default (critical for SEO and Core Web Vitals), it integrates natively with Vercel for zero-config deployment, and it handles image optimisation out of the box via `next/image`.

### Backend / Ecommerce Engine

- **Platform:** Medusa.js v2 (self-hosted)
- **Hosting:** Render
- **Database:** PostgreSQL (Neon-managed for demo)

Medusa provides a production-grade ecommerce data model — products, variants, cart, orders, customers — without building any of it manually. Its REST API is consumed by the Next.js frontend. For the demo, a small seed script will populate under 10 products.

The hosting split is intentional. Medusa's application is a separate Node.js server plus Admin dashboard backed by PostgreSQL, and Medusa's deployment guidance assumes a provider that supports Node.js server deployments with enough memory for the app and admin. Vercel and Netlify remain storefront platforms in this project, not the home for the Medusa application.

For a zero-cost prototype, the backend can run on Render Free and the database can live on Neon Free. This is a pragmatic workaround when Railway requires payment, but it carries real tradeoffs: Render Free can sleep after inactivity and introduce cold starts, and the free tiers across all providers should be treated as prototype infrastructure rather than a stable long-term client deployment target.

### Caching & Performance

- Next.js ISR (Incremental Static Regeneration) for product and category pages — pages are statically generated and revalidated on a schedule, not on every request.
- `next/image` for automatic WebP conversion and lazy loading.
- Vercel's Edge Network handles CDN distribution globally.
- No additional caching layer is required for the demo phase.

### "AI" Features (Simulated)

Both AI-facing features are pre-programmed for the demo and do not call any external AI API.

- **Product Recommendations:** A rule-based function returns a fixed set of related products based on category tag matching. Presented in the UI as "Recommended for you."
- **Shopping Assistant:** A pre-scripted chat widget with branching responses mapped to common shopping questions (e.g. "What's your bestseller?", "Do you offer bulk orders?"). Responses are hardcoded in a JSON config file, making them trivially replaceable with a real LLM call in a later phase.

### Data Layer

- Medusa's PostgreSQL database is the source of truth for all product, cart, and order data.
- No external CMS is used at this stage. Product copy lives in the database and is managed through the Medusa Admin panel.

### Admin Panel

- Medusa ships with a built-in admin dashboard (`@medusajs/admin`). This is deployed alongside the backend and gives the client a UI to manage products, inventory, and orders. It is not the focus of the demo but will be shown briefly to illustrate handoff capability.

---

## 3. What This System Is NOT Doing

The following are explicitly out of scope and should not be built, referenced, or planned for until a separate decision is made:

- Real payment processing (no Stripe, PayPal, or any live gateway)
- User accounts, login, or order history
- Email notifications or transactional email
- Discount codes or promotions engine
- Multi-currency or multi-language support
- Mobile app or PWA
- Real AI/LLM API calls
- Custom CMS or headless CMS integration
- Shopify or any paid ecommerce platform

---

## 4. Hard Rules the Codebase Must Follow

1. **No hardcoded values in source code.** API URLs, keys, and environment-specific config belong in `.env` files only.
2. **No direct AI provider calls from the client.** All AI or simulated-AI logic runs server-side or from a Next.js API route.
3. **No inline styles.** All styling goes through Tailwind utility classes or shadcn/ui components.
4. **Images must use `next/image`.** No raw `<img>` tags. This is non-negotiable for Core Web Vitals.
5. **All Medusa API calls are abstracted behind a service layer** (`/lib/medusa/`) so the frontend never calls Medusa endpoints directly from components.
6. **TypeScript throughout.** No `.js` files in the Next.js project.
7. **The shopping assistant script lives in a single config file** (`/data/assistant-script.json`). No hardcoded chat strings in components.

---

## 5. How the Product Evolves in Layers

| Layer                             | What It Delivers                                                                               |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Layer 1 — Demo**                | Storefront, simulated AI, test checkout, seeded catalogue, deployed on Vercel + Render + Neon  |
| **Layer 2 — Client Handoff**      | Real payment gateway, admin panel polish, product import tooling, domain setup                 |
| **Layer 3 — Production Template** | Full order management, email notifications, discount engine, user accounts                     |
| **Layer 4 — AI Upgrade**          | Replace simulated assistant with real LLM (e.g. Claude API); real personalised recommendations |

Each layer must be fully stable before beginning the next.

---

## 6. Decision Summary

| Decision           | Choice                   | Reason                                             |
| ------------------ | ------------------------ | -------------------------------------------------- |
| Frontend framework | Next.js 14               | SSR/ISR for SEO; native Vercel deployment          |
| Styling            | Tailwind + shadcn/ui     | Fast to build, professional output                 |
| Ecommerce engine   | Medusa.js v2             | Full data model without custom build; open source  |
| Frontend hosting   | Vercel                   | Best fit for Next.js storefront deployment         |
| Backend hosting    | Render                   | Zero-cost Node hosting path for the Medusa app     |
| Database           | Neon Postgres            | Zero-cost PostgreSQL path for the prototype        |
| AI features        | Simulated (pre-scripted) | Saves time; swap-in ready for real LLM later       |
| Payments           | Stripe test mode         | No real transactions needed for demo               |
| Admin panel        | Medusa Admin (built-in)  | Client self-service; no custom build needed        |
| TypeScript         | Yes                      | Catches errors early; required for maintainability |
