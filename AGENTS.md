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

**Phase:** Phase 1 - Seeded Catalogue & Product Pages
**Active task:** Keep Git normalization complete as a prerequisite gate, use the live seeded Medusa backend plus publishable key to build `/products` and `/products/[handle]` through `/lib/medusa/`, and add the basic site shell with a header and footer. Both catalogue routes must use ISR with a 60-second revalidation window.

Refer to `docs/build-plan.md` for full phase definitions and done criteria.

---

## Skills & Activation

Available skills:

- agents-md-improver, brainstorming, caveman, code-architect, code-explorer, code-review, code-reviewer, executing-plans, feature-dev, find-skills, finishing-a-development-branch, frontend-design, mcp-builder, receiving-code-review, requesting-code-review, security-review, skill-creator, subagent-driven-development, systematic-debugging, test-driven-development, using-git-worktrees, using-superpowers, verification-before-completion, writing-plans, writing-skills

Default core activation for every meaningful task:

- `using-superpowers`
- `caveman`
- `code-explorer`
- `code-reviewer`
- `verification-before-completion`

Smart Skill Selection:

- Always start by activating the core defaults and briefly list activated skills in one terse sentence.
- Add `frontend-design` for pages, components, UI polish, responsiveness, accessibility, visual QA, or UX critique.
- Add `security-review` for auth, env vars, secrets, payments, webhooks, permissions, user input, API boundaries, deployment config, or audit tasks.
- Add `systematic-debugging` before fixing any bug, failing check, runtime error, broken flow, flaky behavior, or confusing symptom.
- Add `test-driven-development` before feature work or bugfixes that can be tested.
- Add `receiving-code-review` when acting on audit findings, PR comments, external reviewer feedback, or security recommendations.
- Add `writing-plans` or `code-architect` for multi-step features, schema changes, large refactors, or unclear architecture.
- Add `executing-plans` when implementing an existing written plan.
- Add `requesting-code-review` or `code-review` before merge/PR-ready work or after substantial edits.
- Add `finishing-a-development-branch` when implementation and verification are complete.
- Add `find-skills`, `skill-creator`, `writing-skills`, or `mcp-builder` only when the user asks for skills, skill authoring, plugins, or MCP work.

Skill policy:

- Skills are instructions, not decoration. Read and follow them before acting.
- If multiple skills apply, use the smallest useful set, but do not skip obvious high-value skills.
- If a required skill is missing, say so briefly and continue with the best available workflow.
- Do not let skill rituals slow down GSD. Activate, summarize, execute.

---

## Optimal Workflow

Use this order unless the user explicitly asks for a different workflow:

1. **Activate:** Load core skills plus task-specific skills. State: `Skills: x, y, z.`
2. **Ground:** Inspect repo facts first. Read entrypoints, configs, scripts, env templates, and relevant call sites before asking questions.
3. **Decide:** Classify task as audit, bugfix, feature, frontend, backend, env/deploy, docs, or release. Choose smallest safe path.
4. **Plan lightly:** For simple tasks, proceed. For risky/multi-file work, give a short concrete plan before edits.
5. **Execute scoped:** Change only files needed for the task. Preserve existing patterns. Do not create broad rewrites unless asked.
6. **Review:** Run a self-review pass with `code-reviewer`; add `security-review` for sensitive areas.
7. **Verify:** Run the narrowest meaningful checks first, then broader checks when changes touch shared behavior.
8. **Report:** Final response must be terse: changed behavior, files touched, verification run, known risks/blockers.

Quality gate:

- No feature work before critical env/security/audit blockers are resolved or explicitly deferred by the user.
- No "done" claim without verification evidence.
- No speculative architecture. Codebase truth beats assumptions.
- No stubs that look production-ready but cannot run.

---

## Behavior & Efficiency Rules

Caveman output:

- Default to ruthless caveman brevity: short, direct, technical.
- Kill filler, apologies, praise, and long explanations unless clarity requires them.
- Prefer bullets, compact tables, and exact file references.
- Ask only blocking questions. If a safe assumption exists, state it and continue.

Token efficiency:

- Do not paste giant files unless user asks.
- Summarize exploration findings; cite exact paths/lines for decisions.
- Avoid repeating project context already in this file.
- Use commands and code references instead of prose when faster.

GSD execution:

- Start immediately after skill activation.
- Explore before editing.
- Prefer small, reversible patches.
- Keep task scope tight. Do not sneak in extra features.
- If blocked by missing env, network, credentials, or external service, report exact blocker and best next action.

Quality gates:

- Explorer -> review -> execute -> verify.
- For bugs: reproduce or explain why reproduction is blocked before fixing.
- For security: prove concrete exploit/risk path before severity claims.
- For frontend: verify responsiveness, accessibility basics, image handling, and empty/error states.
- For performance: check unnecessary client components, repeated fetches, cache/ISR behavior, image optimization, bundle-risk dependencies.

---

## Project Commands

Root commands:

- `corepack pnpm install`
- `corepack pnpm dev:storefront`
- `corepack pnpm build:storefront`
- `corepack pnpm lint:storefront`
- `corepack pnpm typecheck:storefront`
- `corepack pnpm dev:backend`
- `corepack pnpm build:backend`

Backend commands:

- `corepack pnpm --filter @allpencils/backend dev`
- `corepack pnpm --filter @allpencils/backend build`
- `corepack pnpm --filter @allpencils/backend db:migrate`
- `corepack pnpm --filter @allpencils/backend seed`
- `corepack pnpm --filter @allpencils/backend test:integration:http`
- `corepack pnpm --filter @allpencils/backend test:integration:modules`
- `corepack pnpm --filter @allpencils/backend test:unit`

Storefront commands:

- `corepack pnpm --filter @allpencils/storefront dev`
- `corepack pnpm --filter @allpencils/storefront build`
- `corepack pnpm --filter @allpencils/storefront lint`
- `corepack pnpm --filter @allpencils/storefront typecheck`

Verification defaults:

- Storefront-only change: run lint + typecheck; run build for route/data/env changes.
- Backend-only change: run backend build; run targeted Medusa script/test when affected.
- Env/deploy change: verify `/status`, backend `/health`, and relevant build.
- Cross-app change: run both app checks where practical.

---

## Architecture & File Map

Workspace:

- `apps/storefront`: Next.js App Router storefront.
- `apps/backend`: Medusa v2 backend.
- `docs`: product, phase, MVP, and prompt source docs.

Storefront:

- `apps/storefront/src/app`: routes and layouts.
- `apps/storefront/src/components`: reusable UI and commerce components.
- `apps/storefront/src/components/ui`: shadcn/radix UI primitives.
- `apps/storefront/src/lib/medusa`: only allowed Medusa Store API service layer.
- `apps/storefront/src/app/globals.css`: design tokens and Tailwind base styles.

Backend:

- `apps/backend/medusa-config.ts`: Medusa runtime config.
- `apps/backend/src/scripts/seed.ts`: demo catalog, region, shipping, inventory, publishable key seed.
- `apps/backend/src/scripts/create-admin.ts`: local/admin user helper.
- `apps/backend/src/api`: custom Medusa routes.
- `apps/backend/integration-tests`: Medusa test setup.

Environment:

- `.env.example`: shared env contract.
- `apps/backend/.env.template`: backend local template.
- `apps/backend/.env`: local backend secrets; never commit.
- `apps/storefront/.env.local`: local storefront secrets/config; never commit.

---

## Git Hygiene & Scope Control

- Check `git status --short` before edits and before final response.
- Never revert user changes unless explicitly asked.
- Never use destructive git commands unless explicitly approved.
- Keep unrelated dirty files untouched.
- Use branch prefix `codex/` for new branches unless user asks otherwise.
- Do not amend commits unless explicitly requested.
- Do not commit secrets, `.env`, `.env.local`, generated build output, or dependency folders.
- If a generated tracked file changes unexpectedly, stop and inspect before deciding.

---

## Security & Environment Rules

- Treat env values, publishable keys, tokens, database URLs, JWT secrets, cookie secrets, admin passwords, and payment config as sensitive.
- Never print secret values in final responses.
- Do not hardcode credentials in source, scripts, tests, docs, or examples.
- If adding env vars, update `.env.example` with placeholder and one-line purpose.
- Prefer strong random secrets for `JWT_SECRET`, `COOKIE_SECRET`, and admin bootstrap passwords.
- Do not enable real payment processing or live Stripe keys unless explicitly instructed.
- Keep `MEDUSA_PUBLISHABLE_KEY` in env only; storefront may use it for Store API calls but must not log it.
- If `REDIS_URL` is absent locally, Medusa may use its fake/in-memory fallback; verify and report that behavior instead of assuming production readiness.

---

## Frontend Rules

- Preserve established visual language unless user asks for redesign.
- Use `next/image` for all rendered images.
- Use server components by default. Add `"use client"` only for browser state, effects, localStorage, or event handlers.
- Keep components accessible: labels for inputs, meaningful button/link text, keyboard-safe controls, visible focus states.
- Handle loading, empty, not-configured, and error states for all async flows.
- Keep Medusa API calls inside `apps/storefront/src/lib/medusa`.
- Avoid new dependencies; prefer existing Next.js, React, Tailwind, shadcn/radix, and lucide stack.
- After multi-component TSX edits, run a React/frontend review pass.

---

## Backend & Medusa Rules

- Keep Medusa config env-driven.
- Run migrations and seed only against intended database.
- Seed scripts must be idempotent or clearly guarded.
- Do not create duplicate regions, products, API keys, stock locations, or shipping options on repeated seed runs.
- Keep inventory realistic for demos.
- Avoid logging secrets except when user explicitly needs one-time local setup output; never include secrets in final answer.
- Prefer Medusa workflows/services over raw database access.
- Keep custom API routes minimal and authenticated/authorized when not public storefront endpoints.

---

## Final Response Contract

- Be terse and evidence-based.
- Mention changed files only when useful.
- Include verification commands and result.
- Include unresolved risks/blockers.
- Do not claim success if checks failed, were skipped, or were blocked.
- If user asks for file content only, output only that content.
