import { defineConfig, loadEnv } from "@medusajs/framework/utils"

import { validateBackendEnv } from "./src/lib/env"

const nodeEnv = process.env.NODE_ENV || "development"
const isBuildCommand = process.argv.some((arg) => arg === "build")
const validationEnv = nodeEnv === "test" || isBuildCommand ? "test" : nodeEnv

loadEnv(nodeEnv, process.cwd())

const {
  databaseUrl,
  storeCors,
  adminCors,
  authCors,
  jwtSecret,
  cookieSecret,
} = validateBackendEnv(process.env, validationEnv)
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
