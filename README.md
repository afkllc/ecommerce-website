# AllPencils

Task 0 boots the local workspace without pretending the commerce stack is live yet.

## Workspace

- `apps/storefront`: Next.js 14 storefront scaffold with a safe status page.
- `apps/backend`: Medusa v2 scaffold with env-only runtime config.
- `.env.example`: shared env contract for the next Phase 0 checkpoint.

## Commands

- `corepack pnpm install`
- `corepack pnpm dev:storefront`
- `corepack pnpm build:storefront`
- `corepack pnpm build:backend`

## Admin User

- pnpm medusa user --email [EMAIL_ADDRESS] --password [PASSWORD]

## Notes

- `MEDUSA_PUBLISHABLE_KEY` stays blank during Task 0. It is created only after a Medusa sales channel exists post-deployment.
- The storefront status page reports configuration state only. It does not call the backend yet.
- Do not run the Medusa backend until real database credentials exist.
