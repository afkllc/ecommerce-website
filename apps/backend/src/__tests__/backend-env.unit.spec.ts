import { validateBackendEnv } from "../lib/env"

describe("validateBackendEnv", () => {
  const validEnv = {
    DATABASE_URL: "postgres://user:pass@example.test:5432/allpencils",
    STORE_CORS: "https://storefront.example.test",
    ADMIN_CORS: "https://admin.example.test",
    AUTH_CORS: "https://storefront.example.test,https://admin.example.test",
    JWT_SECRET: "long-random-jwt-secret-value",
    COOKIE_SECRET: "long-random-cookie-secret-value",
  }

  it("returns trimmed runtime config when required production env is present", () => {
    expect(validateBackendEnv(validEnv, "production")).toEqual({
      databaseUrl: validEnv.DATABASE_URL,
      storeCors: validEnv.STORE_CORS,
      adminCors: validEnv.ADMIN_CORS,
      authCors: validEnv.AUTH_CORS,
      jwtSecret: validEnv.JWT_SECRET,
      cookieSecret: validEnv.COOKIE_SECRET,
    })
  })

  it("fails production boot when required env is empty or placeholder", () => {
    expect(() =>
      validateBackendEnv(
        {
          ...validEnv,
          DATABASE_URL: "",
          JWT_SECRET: "replace-with-a-long-random-string",
        },
        "production"
      )
    ).toThrow("Missing or placeholder backend env")
  })

  it("fails production boot when Medusa would fall back to default secrets", () => {
    expect(() =>
      validateBackendEnv(
        {
          ...validEnv,
          JWT_SECRET: "supersecret",
        },
        "production"
      )
    ).toThrow("Missing or placeholder backend env")
  })

  it("allows test runtime to use Medusa test defaults", () => {
    expect(
      validateBackendEnv(
        {
          DATABASE_URL: "",
          STORE_CORS: "",
          ADMIN_CORS: "",
          AUTH_CORS: "",
          JWT_SECRET: "",
          COOKIE_SECRET: "",
        },
        "test"
      )
    ).toEqual({
      databaseUrl: "",
      storeCors: "",
      adminCors: "",
      authCors: "",
      jwtSecret: "",
      cookieSecret: "",
    })
  })
})
