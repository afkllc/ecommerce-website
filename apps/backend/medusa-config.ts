import { defineConfig, loadEnv } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

const databaseUrl = process.env.DATABASE_URL ?? ""
const storeCors = process.env.STORE_CORS ?? ""
const adminCors = process.env.ADMIN_CORS ?? ""
const authCors = process.env.AUTH_CORS ?? ""
const jwtSecret = process.env.JWT_SECRET ?? ""
const cookieSecret = process.env.COOKIE_SECRET ?? ""
const disableAdmin = process.env.DISABLE_MEDUSA_ADMIN === "true"

module.exports = defineConfig({
  projectConfig: {
    databaseUrl,
    http: {
      storeCors,
      adminCors,
      authCors,
      jwtSecret,
      cookieSecret,
    },
  },
  admin: {
    disable: disableAdmin,
  },
})
