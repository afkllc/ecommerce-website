## Project Context

You are working on **AllPencils**, a reusable ecommerce storefront template currently demoed as a pencil shop. The goal of this build is to produce a polished, fast, demo-ready storefront that a developer can sell to clients as a template. The product is intentionally generic — the client will replace the catalogue and branding later. The current demo target is a prospective client who needs to see a professional, fast storefront with simulated AI features.

**Primary user:** Shoppers browsing and purchasing products online.
**Secondary user:** The store owner, who will manage products via the Medusa Admin panel post-handoff.

---

## Full Stack & Architecture

| Layer              | Technology                             |
| ------------------ | -------------------------------------- |
| Frontend framework | Next.js 14, App Router, TypeScript     |
| Styling            | Tailwind CSS + shadcn/ui               |
| Ecommerce backend  | Medusa.js v2                           |
| Database           | PostgreSQL (Neon-managed)              |
| Frontend hosting   | Vercel                                 |
| Backend hosting    | Render                                 |
| Payments           | Stripe (test mode only — no live keys) |
| AI features        | Simulated — no external AI API calls   |

Hosting is intentionally split: the Next.js storefront deploys to Vercel, while the Medusa application deploys to Render and uses Neon for PostgreSQL. Do not propose a fully Vercel-only or Netlify-only Medusa deployment unless the architecture changes away from self-hosted Medusa. If zero paid hosting is required, treat this as a prototype-grade stack and account for free-tier sleep/cold-start behavior.

The Next.js frontend consumes the Medusa REST API via a service abstraction layer located at `/lib/medusa/`. Components never call Medusa endpoints directly.

Simulated AI features work as follows: product recommendations are computed server-side via a rule-based function in `/lib/recommendations.ts` using category tag matching. The shopping assistant reads from a static script at `/data/assistant-script.json`. Neither feature makes external API calls.

---

## Hard Rules — Follow These Without Exception

1. **No hardcoded values in source code.** API base URLs, keys, and environment-specific config belong exclusively in `.env.local` (local) or the hosting platform's environment dashboard (production). Reference them via `process.env`.
2. **No direct Medusa API calls from components.** All Medusa calls go through functions in `/lib/medusa/`. Components call those functions only.
3. **No raw `<img>` tags.** Use `next/image` for every image without exception. This is required for Core Web Vitals compliance.
4. **No inline styles.** All styling uses Tailwind utility classes or shadcn/ui components.
5. **TypeScript only.** No `.js` or `.jsx` files in the Next.js project.
6. **No AI API calls in the codebase.** All "AI" logic is pre-scripted or rule-based until explicitly instructed otherwise.
7. **Shopping assistant copy lives exclusively in `/data/assistant-script.json`.** No chat strings hardcoded in components.
8. **No new libraries without explicit approval.** Flag the dependency, explain why it is needed, and wait for confirmation before installing.

---

## What Is In Scope

- Next.js frontend: pages, components, layout, routing, data fetching
- Medusa backend: configuration, plugins, seed scripts, API integration
- Simulated AI features: recommendation logic, assistant script
- Stripe test mode integration via Medusa's Stripe plugin
- Tailwind and shadcn/ui styling
- ISR configuration for product and catalogue pages
- Environment variable setup and `.env.example` maintenance

## What Is Explicitly Out of Scope

Do not build, reference, or suggest any of the following unless explicitly instructed:

- Real payment processing or live Stripe keys
- User authentication, accounts, or session management
- Email notifications or transactional email
- Real LLM or AI API calls (OpenAI, Anthropic, etc.)
- Discount or promotions engine
- Multi-currency or multi-language support
- Search functionality
- Mobile app or PWA configuration
- Any Shopify integration

---

## Current Phase

**Phase:** Phase [whatever phase] - [...]
**Active task:** [...]

Refer to `docs/build-plan.md` for full phase definitions and done criteria.

---

## How You Should Behave

**Execute instructions.** Do not replan or re-architect unless something is genuinely broken or a dependency is missing. If the current phase has a clear task, do it.

**Flag blocked dependencies before starting.** If a task depends on something that does not exist yet (a missing API route, an unset environment variable, a component that has not been built), say so clearly before writing any code. Do not proceed with stubs that will break.

**Ask before introducing new libraries.** If a task would be cleaner with an additional package, name it, explain why, and wait for approval. Do not install anything unilaterally.

**Do not add features that were not asked for.** Scope is intentionally tight. A working core loop beats a half-built extended feature set.

**When editing existing files, show only the changed section** with enough surrounding context to locate it unambiguously. Do not reprint entire files unless asked.

**Keep environment hygiene clean.** If you add a new environment variable, add a corresponding entry to `.env.example` with a placeholder value and a one-line comment explaining its purpose.
