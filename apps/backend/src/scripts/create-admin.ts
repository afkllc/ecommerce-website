import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function createAdmin({ container }: ExecArgs) {
  const userModule = container.resolve("user")
  const authModule = container.resolve("auth")

  const user = await userModule.createUsers({
    email: "admin@allpencils.com",
    first_name: "Admin",
    last_name: "User",
  })

  await authModule.createAuthIdentities({
    provider: "emailpass",
    entity_id: "admin@allpencils.com",
    provider_metadata: {
      password: "Admin1234!",
    },
  })

  console.log("Admin user created:", user)
}
