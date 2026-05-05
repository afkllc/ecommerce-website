type BackendEnv = Record<string, string | undefined>

export type BackendRuntimeConfig = {
  databaseUrl: string
  storeCors: string
  adminCors: string
  authCors: string
  jwtSecret: string
  cookieSecret: string
}

const REQUIRED_ENV_KEYS = [
  "DATABASE_URL",
  "STORE_CORS",
  "ADMIN_CORS",
  "AUTH_CORS",
  "JWT_SECRET",
  "COOKIE_SECRET",
] as const

const PLACEHOLDER_PATTERNS = [
  /^replace/i,
  /^your-/i,
  /^changeme/i,
  /^example/i,
  /^todo/i,
  /^supersecret$/i,
]

function normalizeEnvValue(value: string | undefined) {
  return value?.trim() ?? ""
}

function isPlaceholder(value: string) {
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value))
}

function requireRuntimeValue(env: BackendEnv, key: (typeof REQUIRED_ENV_KEYS)[number]) {
  const value = normalizeEnvValue(env[key])

  if (!value || isPlaceholder(value)) {
    return null
  }

  return value
}

export function validateBackendEnv(
  env: BackendEnv,
  nodeEnv = "development"
): BackendRuntimeConfig {
  const config = {
    databaseUrl: normalizeEnvValue(env.DATABASE_URL),
    storeCors: normalizeEnvValue(env.STORE_CORS),
    adminCors: normalizeEnvValue(env.ADMIN_CORS),
    authCors: normalizeEnvValue(env.AUTH_CORS),
    jwtSecret: normalizeEnvValue(env.JWT_SECRET),
    cookieSecret: normalizeEnvValue(env.COOKIE_SECRET),
  }

  if (nodeEnv === "test") {
    return config
  }

  const missingKeys = REQUIRED_ENV_KEYS.filter(
    (key) => requireRuntimeValue(env, key) === null
  )

  if (missingKeys.length) {
    throw new Error(
      `Missing or placeholder backend env: ${missingKeys.join(", ")}`
    )
  }

  return config
}
