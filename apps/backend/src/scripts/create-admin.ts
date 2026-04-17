import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function createAdmin({ container }: ExecArgs) {
  const userModule = container.resolve("user")
  const authModule = container.resolve("auth")
  const email = "admin@allpencils.com"
  const password = "Admin1234!"

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

  console.log("Admin user ready:", user)
}
