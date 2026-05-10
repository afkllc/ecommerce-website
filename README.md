# AllPencils

Reusable ecommerce storefront template, currently demoed as a pencil shop.

- Storefront: Next.js 14, Tailwind CSS, shadcn/ui
- Backend: Medusa v2
- Database: PostgreSQL
- Checkout: no-card simulated checkout

## Prerequisites

Install these first:

- Node.js 20+
- Docker Desktop, if running the backend locally
- Git

This repo uses pnpm through Corepack, so you do not need to install pnpm manually.

## 1. Open the Real Repo

Use this path:

```powershell
cd C:\Users\saqla\Documents\ecommerce-website
```

Do not use the old OneDrive copy.

## 2. Install Dependencies

```powershell
corepack enable
corepack pnpm install
```

## 3. Run Storefront Only

Use this if you already have backend URL and publishable key values.

Create `apps/storefront/.env.local`:

```env
MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
MEDUSA_PUBLISHABLE_KEY=replace-with-your-publishable-key
NEXT_PUBLIC_MEDUSA_SHIPPING_OPTION_NAME=
NEXT_PUBLIC_MEDUSA_PAYMENT_PROVIDER_ID=
```

Then run:

```powershell
corepack pnpm dev:storefront
```

Open:

```text
http://localhost:3000
```

If `MEDUSA_PUBLISHABLE_KEY` is missing, the site still opens, but catalogue/cart data will not work fully.

## 4. Run Full Local Stack

Use this if you want local backend + local database.

Start Docker Desktop, then create a local disposable PostgreSQL database:

```powershell
docker run --name allpencils-postgres -e POSTGRES_USER=allpencils -e POSTGRES_PASSWORD=allpencils -e POSTGRES_DB=allpencils_dev -p 5432:5432 -d postgres:16
```

If you already created it before, start it instead:

```powershell
docker start allpencils-postgres
```

Create `apps/backend/.env`:

```env
DATABASE_URL=postgresql://allpencils:allpencils@localhost:5432/allpencils_dev
STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:9000
AUTH_CORS=http://localhost:3000,http://localhost:9000
JWT_SECRET=replace-with-a-long-random-string
COOKIE_SECRET=replace-with-a-long-random-string
REDIS_URL=
DISABLE_MEDUSA_ADMIN=false
```

Generate two local secret strings:

```powershell
[guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N")
```

Run that twice. Put one value in `JWT_SECRET` and one in `COOKIE_SECRET`.

Run database setup:

```powershell
corepack pnpm --filter @allpencils/backend db:migrate
corepack pnpm --filter @allpencils/backend seed
```

Create an admin user:

```powershell
cd apps/backend
.\node_modules\.bin\medusa.CMD exec ./src/scripts/create-admin.ts --email you@example.com --password "use-a-real-local-password"
cd ..\..
```

Do not commit real admin passwords.

Start backend:

```powershell
corepack pnpm dev:backend
```

Backend opens at:

```text
http://localhost:9000
```

Medusa Admin opens at:

```text
http://localhost:9000/app
```

Log in, open the publishable API keys area, and copy the local storefront publishable key.

Create `apps/storefront/.env.local`:

```env
MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
MEDUSA_PUBLISHABLE_KEY=paste-your-local-publishable-key-here
NEXT_PUBLIC_MEDUSA_SHIPPING_OPTION_NAME=
NEXT_PUBLIC_MEDUSA_PAYMENT_PROVIDER_ID=
```

In a second PowerShell window, start storefront:

```powershell
corepack pnpm dev:storefront
```

Storefront opens at:

```text
http://localhost:3000
```

## Useful Commands

```powershell
corepack pnpm lint:storefront
corepack pnpm typecheck:storefront
corepack pnpm build:storefront
corepack pnpm build:backend
```

Backend integration tests need `apps/backend/.env.test` pointed at a disposable local/test PostgreSQL database:

```powershell
corepack pnpm --filter @allpencils/backend test:integration:http
```

## Common Fixes

Docker container already exists:

```powershell
docker start allpencils-postgres
```

Port already in use:

- Storefront uses `3000`.
- Backend uses `9000`.
- PostgreSQL uses `5432`.

Fresh install after dependency trouble:

```powershell
corepack pnpm install
```

## Safety

- Do not commit `.env`, `.env.local`, `.env.test`, passwords, database URLs, or API keys.
- Do not use production or hosted customer data for local tests.
- Checkout is no-card simulated checkout. Do not add card number, expiry, or CVC fields unless real Stripe Elements is implemented.
