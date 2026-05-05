import { ExecArgs } from "@medusajs/framework/types"

type AdminCredentialsInput = {
  env?: Record<string, string | undefined>
  args?: string[] | Record<string, unknown>
}

type AdminCredentials = {
  email: string
  password: string
}

const PLACEHOLDER_PATTERNS = [
  /^replace/i,
  /^your-/i,
  /^changeme/i,
  /^example/i,
  /^todo/i,
]

function normalizeValue(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function getArgValue(args: string[] | Record<string, unknown>, key: string) {
  if (!Array.isArray(args)) {
    return normalizeValue(args[key])
  }

  const flag = `--${key}`
  const inlineArg = args.find((arg) => arg.startsWith(`${flag}=`))

  if (inlineArg) {
    return normalizeValue(inlineArg.slice(flag.length + 1))
  }

  const index = args.indexOf(flag)

  if (index >= 0) {
    return normalizeValue(args[index + 1])
  }

  return ""
}

function isPlaceholder(value: string) {
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value))
}

export function getAdminCredentials({
  env = process.env,
  args = [],
}: AdminCredentialsInput = {}): AdminCredentials {
  const email =
    getArgValue(args, "email") || normalizeValue(env.MEDUSA_ADMIN_EMAIL)
  const password =
    getArgValue(args, "password") || normalizeValue(env.MEDUSA_ADMIN_PASSWORD)

  if (!email || !password) {
    throw new Error(
      "MEDUSA_ADMIN_EMAIL and MEDUSA_ADMIN_PASSWORD are required to create an admin user."
    )
  }

  if (isPlaceholder(email) || isPlaceholder(password)) {
    throw new Error("Admin credentials must not use placeholder values.")
  }

  return { email, password }
}

export default async function createAdmin({ container, args }: ExecArgs) {
  const userModule = container.resolve("user")
  const authModule = container.resolve("auth")
  const logger = container.resolve("logger")
  const { email, password } = getAdminCredentials({
    args: args as AdminCredentialsInput["args"],
  })

  const existingUsers = await userModule.listUsers({ email: [email] })
  const user =
    existingUsers[0] ??
    (await userModule.createUsers({
      email,
      first_name: "Admin",
      last_name: "User",
    }))

  const existingAuthIdentities = await authModule.listAuthIdentities({
    provider_identities: {
      provider: "emailpass",
      entity_id: email,
    },
  })

  const authIdentity = existingAuthIdentities[0]
    ? await authModule.updateAuthIdentities({
        id: existingAuthIdentities[0].id,
        app_metadata: { user_id: user.id },
      })
    : await authModule.createAuthIdentities({
        app_metadata: { user_id: user.id },
        provider_identities: [
          {
            provider: "emailpass",
            entity_id: email,
            provider_metadata: {
              password,
            },
          },
        ],
      })

  const providerIdentity = authIdentity.provider_identities?.find(
    (identity) => identity.provider === "emailpass" && identity.entity_id === email
  )

  if (providerIdentity?.id) {
    await authModule.updateProviderIdentities({
      id: providerIdentity.id,
      entity_id: email,
      provider_metadata: {
        password,
      },
    })
  }

  logger.info("Admin user ready.")
}
