import { getAdminCredentials } from "../scripts/create-admin"

describe("getAdminCredentials", () => {
  it("reads admin credentials from env", () => {
    expect(
      getAdminCredentials({
        env: {
          MEDUSA_ADMIN_EMAIL: " owner@example.test ",
          MEDUSA_ADMIN_PASSWORD: " strong-random-admin-password ",
        },
        args: [],
      })
    ).toEqual({
      email: "owner@example.test",
      password: "strong-random-admin-password",
    })
  })

  it("lets CLI args override env values", () => {
    expect(
      getAdminCredentials({
        env: {
          MEDUSA_ADMIN_EMAIL: "env@example.test",
          MEDUSA_ADMIN_PASSWORD: "env-admin-password",
        },
        args: [
          "--email",
          "cli@example.test",
          "--password",
          "cli-admin-password",
        ],
      })
    ).toEqual({
      email: "cli@example.test",
      password: "cli-admin-password",
    })
  })

  it("fails clearly when required credentials are missing", () => {
    expect(() =>
      getAdminCredentials({
        env: {},
        args: [],
      })
    ).toThrow("MEDUSA_ADMIN_EMAIL and MEDUSA_ADMIN_PASSWORD are required")
  })

  it("rejects placeholder credentials", () => {
    expect(() =>
      getAdminCredentials({
        env: {
          MEDUSA_ADMIN_EMAIL: "admin@example.test",
          MEDUSA_ADMIN_PASSWORD: "replace-with-a-long-random-string",
        },
        args: [],
      })
    ).toThrow("Admin credentials must not use placeholder values")
  })
})
