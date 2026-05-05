# Integration Tests

The `medusa-test-utils` package provides utility functions to create integration tests for your API routes and workflows.

Run HTTP integration tests with:

```bash
corepack pnpm --filter @allpencils/backend test:integration:http
```

Tests load `apps/backend/.env.test` through Medusa's test env loader. Do not commit that file. Required values:

```bash
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/TEST_DATABASE
STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:9000
AUTH_CORS=http://localhost:3000,http://localhost:9000
JWT_SECRET=replace-with-test-secret
COOKIE_SECRET=replace-with-test-secret
```

For example:

```ts
import { medusaIntegrationTestRunner } from "medusa-test-utils"

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("Custom endpoints", () => {
      describe("GET /store/custom", () => {
        it("returns correct message", async () => {
          const response = await api.get(
            `/store/custom`
          )
  
          expect(response.status).toEqual(200)
          expect(response.data).toHaveProperty("message")
          expect(response.data.message).toEqual("Hello, World!")
        })
      })
    })
  }
})
```

Learn more in [this documentation](https://docs.medusajs.com/learn/debugging-and-testing/testing-tools/integration-tests).
