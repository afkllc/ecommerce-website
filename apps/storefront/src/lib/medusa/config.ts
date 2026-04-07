export type MedusaConfigEntryStatus = "configured" | "missing" | "deferred"

export type MedusaConfigEntry = {
  key:
    | "MEDUSA_BACKEND_URL"
    | "NEXT_PUBLIC_MEDUSA_BACKEND_URL"
    | "MEDUSA_PUBLISHABLE_KEY"
  description: string
  status: MedusaConfigEntryStatus
  value: string | null
}

const PLACEHOLDER_PATTERNS = [
  /^replace/i,
  /^your-/i,
  /^changeme/i,
  /^example/i,
  /^todo/i,
]

function normalizeEnvValue(value: string | undefined) {
  const trimmed = value?.trim()

  if (!trimmed) {
    return null
  }

  if (PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return null
  }

  return trimmed
}

function normalizeBaseUrl(value: string | undefined) {
  const normalizedValue = normalizeEnvValue(value)

  if (!normalizedValue) {
    return null
  }

  return normalizedValue.replace(/\/+$/, "")
}

function createEntry(
  key: MedusaConfigEntry["key"],
  description: string,
  value: string | undefined,
  fallbackStatus: Exclude<MedusaConfigEntryStatus, "configured">
): MedusaConfigEntry {
  const normalizedValue = normalizeEnvValue(value)

  return {
    key,
    description,
    status: normalizedValue ? "configured" : fallbackStatus,
    value: normalizedValue,
  }
}

export function getMedusaConfigStatus() {
  const serverBaseUrl = normalizeBaseUrl(process.env.MEDUSA_BACKEND_URL)
  const browserBaseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL)

  const entries: MedusaConfigEntry[] = [
    createEntry(
      "MEDUSA_BACKEND_URL",
      "Server-side Medusa base URL used by the storefront service layer.",
      serverBaseUrl ?? undefined,
      "missing"
    ),
    createEntry(
      "NEXT_PUBLIC_MEDUSA_BACKEND_URL",
      "Client-safe Medusa base URL reserved for future browser cart and checkout flows.",
      browserBaseUrl ?? undefined,
      "missing"
    ),
    createEntry(
      "MEDUSA_PUBLISHABLE_KEY",
      "Required for storefront product browsing after the live Phase 1 Medusa seed creates it.",
      process.env.MEDUSA_PUBLISHABLE_KEY,
      "missing"
    ),
  ]

  const serverEntry = entries[0]
  const browserEntry = entries[1]
  const publishableEntry = entries[2]

  return {
    entries,
    serverBaseUrl,
    browserBaseUrl,
    canAttemptServerCalls: serverEntry.status === "configured",
    canAttemptBrowserCalls: browserEntry.status === "configured",
    hasPublishableKey: publishableEntry.status === "configured",
  }
}
