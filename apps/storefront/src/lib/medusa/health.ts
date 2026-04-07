import { getMedusaConfigStatus } from "./config"

export type MedusaHealthStatus = "healthy" | "not-configured" | "unreachable"

export type MedusaHealthResult = {
  status: MedusaHealthStatus
  message: string
  url: string | null
  httpStatus: number | null
  payload: unknown | null
}

type MedusaHealthPayload = {
  status?: string
}

function isMedusaHealthPayload(value: unknown): value is MedusaHealthPayload {
  if (!value || typeof value !== "object") {
    return false
  }

  return "status" in value
}

function getHealthUrl(baseUrl: string) {
  return `${baseUrl.replace(/\/+$/, "")}/health`
}

function isPlainTextOk(value: unknown) {
  return typeof value === "string" && value.trim().toUpperCase() === "OK"
}

function parseHealthPayload(value: string): unknown | null {
  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return "The Medusa backend could not be reached from the storefront."
}

export async function getMedusaHealthStatus(): Promise<MedusaHealthResult> {
  const config = getMedusaConfigStatus()
  const backendUrl = config.serverBaseUrl

  if (!backendUrl) {
    return {
      status: "not-configured",
      message: "Set MEDUSA_BACKEND_URL to enable the real backend health check.",
      url: null,
      httpStatus: null,
      payload: null,
    }
  }

  const healthUrl = getHealthUrl(backendUrl)

  try {
    const response = await fetch(healthUrl, {
      headers: {
        Accept: "application/json, text/plain;q=0.9",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    })

    const rawBody = await response.text()
    const payload = parseHealthPayload(rawBody)

    if (response.ok && isPlainTextOk(rawBody)) {
      return {
        status: "healthy",
        message: "The storefront reached Medusa successfully.",
        url: healthUrl,
        httpStatus: response.status,
        payload: rawBody,
      }
    }

    if (response.ok && isMedusaHealthPayload(payload) && payload.status === "ok") {
      return {
        status: "healthy",
        message: "The storefront reached Medusa successfully.",
        url: healthUrl,
        httpStatus: response.status,
        payload,
      }
    }

    return {
      status: "unreachable",
      message: "The backend responded, but it did not return the expected Medusa health response.",
      url: healthUrl,
      httpStatus: response.status,
      payload: payload ?? rawBody,
    }
  } catch (error) {
    return {
      status: "unreachable",
      message: getErrorMessage(error),
      url: healthUrl,
      httpStatus: null,
      payload: null,
    }
  }
}
