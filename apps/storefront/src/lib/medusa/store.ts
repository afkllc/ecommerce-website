import { getMedusaConfigStatus } from "./config"

export const MEDUSA_STORE_REVALIDATE_SECONDS = 60
const STORE_PRODUCT_FIELDS =
  "*variants.calculated_price,+variants.inventory_quantity,+metadata,*categories"

type StoreRegionCountry = {
  iso_2: string
}

export type StoreRegion = {
  id: string
  name: string
  currency_code: string
  countries?: StoreRegionCountry[]
}

type StoreProductImage = {
  id?: string
  url: string
}

type StoreProductCategory = {
  id: string
  name: string
}

type StoreProductOptionValue = {
  id: string
  value: string
}

type StoreProductOption = {
  id: string
  title: string
  values: StoreProductOptionValue[]
}

type StoreVariantOption = {
  value: string
  option?: {
    title: string
  } | null
}

type StoreVariantCalculatedPrice = {
  calculated_amount?: number
  calculated_price?: {
    price_list_type?: string
  }
}

export type StoreProductVariant = {
  id: string
  title: string
  sku?: string | null
  manage_inventory?: boolean
  inventory_quantity?: number
  options?: StoreVariantOption[]
  calculated_price?: StoreVariantCalculatedPrice | null
}

export type StoreProduct = {
  id: string
  title: string
  handle: string
  description?: string | null
  thumbnail?: string | null
  images: StoreProductImage[]
  categories?: StoreProductCategory[]
  options: StoreProductOption[]
  variants: StoreProductVariant[]
  metadata?: {
    audience?: string
    recommendation_tags?: string[]
    story?: string
  }
}

type StoreRegionsResponse = {
  regions: StoreRegion[]
}

type StoreProductsResponse = {
  products: StoreProduct[]
  count: number
  limit: number
  offset: number
}

export type StorefrontDataResult<T> =
  | {
      status: "ready"
      data: T
      region: StoreRegion
    }
  | {
      status: "not-configured" | "error" | "not-found"
      message: string
      data: null
      region: null
    }

function getPublishableKey() {
  const value = process.env.MEDUSA_PUBLISHABLE_KEY?.trim()

  return value ? value : null
}

function getBaseUrl() {
  const config = getMedusaConfigStatus()

  return config.serverBaseUrl
}

async function medusaStoreFetch<T>(
  path: string,
  searchParams: Record<string, string> = {}
) {
  const baseUrl = getBaseUrl()
  const publishableKey = getPublishableKey()

  if (!baseUrl || !publishableKey) {
    throw new Error(
      "MEDUSA_BACKEND_URL and MEDUSA_PUBLISHABLE_KEY must be configured for storefront product browsing."
    )
  }

  const url = new URL(path, baseUrl)

  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "x-publishable-api-key": publishableKey,
    },
    next: {
      revalidate: MEDUSA_STORE_REVALIDATE_SECONDS,
    },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || "Medusa Store API request failed.")
  }

  return (await response.json()) as T
}

export async function getStoreRegion() {
  return medusaStoreFetch<StoreRegionsResponse>("/store/regions")
}

export async function listStoreProducts(): Promise<StorefrontDataResult<StoreProduct[]>> {
  if (!getBaseUrl() || !getPublishableKey()) {
    return {
      status: "not-configured",
      message:
        "Set MEDUSA_BACKEND_URL and MEDUSA_PUBLISHABLE_KEY to browse the live Medusa catalogue.",
      data: null,
      region: null,
    }
  }

  try {
    const { regions } = await getStoreRegion()
    const region = regions[0]

    if (!region) {
      return {
        status: "error",
        message: "No Medusa regions were returned for the storefront.",
        data: null,
        region: null,
      }
    }

    const { products } = await medusaStoreFetch<StoreProductsResponse>(
      "/store/products",
      {
        fields: STORE_PRODUCT_FIELDS,
        limit: "24",
        region_id: region.id,
      }
    )

    return {
      status: "ready",
      data: [...products].sort((left, right) => left.title.localeCompare(right.title)),
      region,
    }
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "The storefront could not retrieve products from Medusa.",
      data: null,
      region: null,
    }
  }
}

export async function getStoreProductByHandle(
  handle: string
): Promise<StorefrontDataResult<StoreProduct>> {
  if (!getBaseUrl() || !getPublishableKey()) {
    return {
      status: "not-configured",
      message:
        "Set MEDUSA_BACKEND_URL and MEDUSA_PUBLISHABLE_KEY to browse the live Medusa catalogue.",
      data: null,
      region: null,
    }
  }

  try {
    const { regions } = await getStoreRegion()
    const region = regions[0]

    if (!region) {
      return {
        status: "error",
        message: "No Medusa regions were returned for the storefront.",
        data: null,
        region: null,
      }
    }

    const { products } = await medusaStoreFetch<StoreProductsResponse>(
      "/store/products",
      {
        fields: STORE_PRODUCT_FIELDS,
        handle,
        limit: "1",
        region_id: region.id,
      }
    )

    const product = products[0]

    if (!product) {
      return {
        status: "not-found",
        message: "That product could not be found in the current catalogue.",
        data: null,
        region: null,
      }
    }

    return {
      status: "ready",
      data: product,
      region,
    }
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "The storefront could not retrieve this product from Medusa.",
      data: null,
      region: null,
    }
  }
}

export function getProductPrimaryImage(product: StoreProduct) {
  return product.thumbnail ?? product.images[0]?.url ?? null
}

export function getProductPrice(product: StoreProduct) {
  const cheapestVariant = [...product.variants].sort((left, right) => {
    const leftAmount = left.calculated_price?.calculated_amount ?? Number.MAX_SAFE_INTEGER
    const rightAmount =
      right.calculated_price?.calculated_amount ?? Number.MAX_SAFE_INTEGER

    return leftAmount - rightAmount
  })[0]

  return cheapestVariant?.calculated_price?.calculated_amount ?? null
}

export function formatCurrency(amount: number | null, currencyCode: string) {
  if (amount === null) {
    return "Unavailable"
  }

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
  }).format(amount)
}
