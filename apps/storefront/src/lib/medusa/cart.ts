import { formatCurrency } from "./store"

export const CART_STORAGE_KEY = "allpencils_cart_id"

type CartClientConfig = {
  publishableKey?: string | null
  paymentProviderId?: string | null
  shippingOptionName?: string | null
}

type StoreRegionsResponse = {
  regions: StoreCartRegion[]
}

type StoreCartResponse = {
  cart: StoreCart
}

type StoreDeleteLineItemResponse = {
  parent: StoreCart
}

type StoreShippingOptionsResponse = {
  shipping_options: StoreShippingOption[]
}

type StorePaymentProvidersResponse = {
  payment_providers: StorePaymentProvider[]
}

type StorePaymentCollectionResponse = {
  payment_collection: StorePaymentCollection
}

type StoreOrderResponse = {
  order: StoreOrder
}

export type CompleteCartResponse =
  | {
      type: "cart"
      cart: StoreCart
      error?: {
        message?: string
      }
    }
  | {
      type: "order"
      order: StoreOrder
    }

export type StoreCartRegionCountry = {
  iso_2: string
  name: string
  display_name?: string
}

export type StoreCartRegion = {
  id: string
  name: string
  currency_code: string
  countries?: StoreCartRegionCountry[]
}

export type StoreCartAddress = {
  first_name: string
  last_name: string
  company?: string | null
  address_1: string
  address_2?: string | null
  city: string
  postal_code: string
  country_code: string
  province?: string | null
  phone?: string | null
}

export type StoreCartItem = {
  id: string
  title: string
  subtitle?: string | null
  thumbnail?: string | null
  product_handle?: string | null
  variant_id: string
  variant_title?: string | null
  variant_sku?: string | null
  quantity: number
  unit_price: number
  subtotal?: number
  total?: number
}

export type StoreCartShippingMethod = {
  id: string
  amount: number
  shipping_option_id: string
  name?: string | null
}

export type StorePaymentSession = {
  id: string
  provider_id: string
  status: string
  amount: number
}

export type StorePaymentCollection = {
  id: string
  currency_code: string
  amount: number
  payment_sessions: StorePaymentSession[]
}

export type StorePaymentProvider = {
  id: string
  is_enabled: boolean
}

export type StoreShippingOption = {
  id: string
  name: string
  amount?: number
  calculated_price?: {
    calculated_amount?: number
    currency_code?: string
  }
  type?: {
    label?: string
    code?: string
  }
}

export type StoreCart = {
  id: string
  currency_code: string
  email?: string | null
  region_id: string
  subtotal: number
  total: number
  shipping_total: number
  item_total: number
  items: StoreCartItem[]
  shipping_methods: StoreCartShippingMethod[]
  shipping_address?: StoreCartAddress | null
  billing_address?: StoreCartAddress | null
  region?: StoreCartRegion | null
}

export type StoreOrder = {
  id: string
  display_id?: number | null
  email?: string | null
  currency_code: string
  subtotal: number
  total: number
  shipping_total: number
  status?: string
  items?: Array<{
    id: string
    title: string
    subtitle?: string | null
    quantity: number
    thumbnail?: string | null
  }>
  summary?: {
    current_order_total?: number
  }
}

export class MedusaStorefrontError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = "MedusaStorefrontError"
    this.status = status
  }
}

function getBaseUrl() {
  const value =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL?.trim() ??
    process.env.MEDUSA_BACKEND_URL?.trim()

  return value ? value.replace(/\/+$/, "") : null
}

function getPublishableKey(config?: CartClientConfig) {
  const configuredValue = config?.publishableKey?.trim()

  if (configuredValue) {
    return configuredValue
  }

  if (typeof window === "undefined") {
    const serverValue = process.env.MEDUSA_PUBLISHABLE_KEY?.trim()

    return serverValue ? serverValue : null
  }

  return null
}

function getConfiguredPaymentProviderId(config?: CartClientConfig) {
  const configuredValue =
    config?.paymentProviderId?.trim() ??
    process.env.NEXT_PUBLIC_MEDUSA_PAYMENT_PROVIDER_ID?.trim()

  return configuredValue || null
}

function getConfiguredShippingOptionName(config?: CartClientConfig) {
  const configuredValue =
    config?.shippingOptionName?.trim() ??
    process.env.NEXT_PUBLIC_MEDUSA_SHIPPING_OPTION_NAME?.trim()

  return configuredValue || null
}

export function selectCartShippingOption(
  options: StoreShippingOption[],
  config?: CartClientConfig
) {
  const configuredName = getConfiguredShippingOptionName(config)

  if (configuredName) {
    return options.find((option) => option.name === configuredName) ?? null
  }

  return options[0] ?? null
}

function selectPaymentProvider(
  providers: StorePaymentProvider[],
  config?: CartClientConfig
) {
  const enabledProviders = providers.filter((provider) => provider.is_enabled)
  const configuredProviderId = getConfiguredPaymentProviderId(config)

  if (configuredProviderId) {
    return (
      enabledProviders.find((provider) => provider.id === configuredProviderId) ??
      null
    )
  }

  return enabledProviders[0] ?? null
}

async function getErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as
      | { message?: string; error?: { message?: string } }
      | undefined

    if (data?.error?.message) {
      return data.error.message
    }

    if (data?.message) {
      return data.message
    }
  } catch {
    // Ignore JSON parsing errors and fall back to the response text.
  }

  try {
    const text = await response.text()

    return text || "Medusa Store API request failed."
  } catch {
    return "Medusa Store API request failed."
  }
}

async function medusaCartFetch<T>(
  path: string,
  options: {
    config?: CartClientConfig
    method?: "GET" | "POST" | "DELETE"
    body?: unknown
    searchParams?: Record<string, string>
  } = {}
) {
  const baseUrl = getBaseUrl()
  const publishableKey = getPublishableKey(options.config)

  if (!baseUrl) {
    throw new MedusaStorefrontError(
      "NEXT_PUBLIC_MEDUSA_BACKEND_URL must be configured for cart and checkout."
    )
  }

  if (!publishableKey) {
    throw new MedusaStorefrontError(
      "MEDUSA_PUBLISHABLE_KEY is missing from the storefront runtime."
    )
  }

  const url = new URL(path, baseUrl)

  Object.entries(options.searchParams ?? {}).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-publishable-api-key": publishableKey,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  })

  if (!response.ok) {
    throw new MedusaStorefrontError(
      await getErrorMessage(response),
      response.status
    )
  }

  return (await response.json()) as T
}

async function getDefaultRegion(config?: CartClientConfig) {
  const { regions } = await medusaCartFetch<StoreRegionsResponse>("/store/regions", {
    config,
  })

  const region = regions[0]

  if (!region) {
    throw new MedusaStorefrontError(
      "No Medusa regions are available for cart creation."
    )
  }

  return region
}

function getRequiredCartId() {
  const cartId = getCartId()

  if (!cartId) {
    throw new MedusaStorefrontError("A cart has not been created yet.")
  }

  return cartId
}

export function getCartId() {
  if (typeof window === "undefined") {
    return null
  }

  return window.localStorage.getItem(CART_STORAGE_KEY)
}

export function setCartId(cartId: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CART_STORAGE_KEY, cartId)
  }
}

export function clearCartId() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(CART_STORAGE_KEY)
  }
}

export async function createCart(config?: CartClientConfig) {
  const region = await getDefaultRegion(config)
  const { cart } = await medusaCartFetch<StoreCartResponse>("/store/carts", {
    config,
    method: "POST",
    body: {
      region_id: region.id,
    },
  })

  setCartId(cart.id)

  return cart
}

export async function retrieveCart(cartId: string, config?: CartClientConfig) {
  const { cart } = await medusaCartFetch<StoreCartResponse>(`/store/carts/${cartId}`, {
    config,
  })

  return cart
}

export async function ensureCart(config?: CartClientConfig) {
  const existingCartId = getCartId()

  if (!existingCartId) {
    return createCart(config)
  }

  try {
    return await retrieveCart(existingCartId, config)
  } catch (error) {
    if (error instanceof MedusaStorefrontError && error.status === 404) {
      clearCartId()
      return createCart(config)
    }

    throw error
  }
}

export async function addLineItem(
  input: {
    variantId: string
    quantity?: number
  },
  config?: CartClientConfig
) {
  const cart = await ensureCart(config)
  const { cart: updatedCart } = await medusaCartFetch<StoreCartResponse>(
    `/store/carts/${cart.id}/line-items`,
    {
      config,
      method: "POST",
      body: {
        variant_id: input.variantId,
        quantity: input.quantity ?? 1,
      },
    }
  )

  return updatedCart
}

export async function updateLineItem(
  lineItemId: string,
  quantity: number,
  config?: CartClientConfig
) {
  const cartId = getRequiredCartId()
  const { cart } = await medusaCartFetch<StoreCartResponse>(
    `/store/carts/${cartId}/line-items/${lineItemId}`,
    {
      config,
      method: "POST",
      body: {
        quantity,
      },
    }
  )

  return cart
}

export async function removeLineItem(
  lineItemId: string,
  config?: CartClientConfig
) {
  const cartId = getRequiredCartId()
  const { parent } = await medusaCartFetch<StoreDeleteLineItemResponse>(
    `/store/carts/${cartId}/line-items/${lineItemId}`,
    {
      config,
      method: "DELETE",
    }
  )

  return parent
}

async function updateCart(
  data: Record<string, unknown>,
  config?: CartClientConfig
) {
  const cartId = getRequiredCartId()
  const { cart } = await medusaCartFetch<StoreCartResponse>(`/store/carts/${cartId}`, {
    config,
    method: "POST",
    body: data,
  })

  return cart
}

export async function setCartEmail(email: string, config?: CartClientConfig) {
  return updateCart(
    {
      email,
    },
    config
  )
}

export async function setCartAddresses(
  input: {
    shippingAddress: StoreCartAddress
    billingAddress?: StoreCartAddress
  },
  config?: CartClientConfig
) {
  return updateCart(
    {
      shipping_address: input.shippingAddress,
      billing_address: input.billingAddress ?? input.shippingAddress,
    },
    config
  )
}

export async function listCartShippingOptions(config?: CartClientConfig) {
  const cartId = getRequiredCartId()
  const { shipping_options } = await medusaCartFetch<StoreShippingOptionsResponse>(
    "/store/shipping-options",
    {
      config,
      searchParams: {
        cart_id: cartId,
      },
    }
  )

  return shipping_options
}

export async function applyShippingMethod(
  optionId: string,
  config?: CartClientConfig
) {
  const cartId = getRequiredCartId()
  const { cart } = await medusaCartFetch<StoreCartResponse>(
    `/store/carts/${cartId}/shipping-methods`,
    {
      config,
      method: "POST",
      body: {
        option_id: optionId,
      },
    }
  )

  return cart
}

async function listPaymentProviders(regionId: string, config?: CartClientConfig) {
  const { payment_providers } = await medusaCartFetch<StorePaymentProvidersResponse>(
    "/store/payment-providers",
    {
      config,
      searchParams: {
        region_id: regionId,
      },
    }
  )

  return payment_providers
}

async function createPaymentCollection(
  cartId: string,
  config?: CartClientConfig
) {
  const { payment_collection } =
    await medusaCartFetch<StorePaymentCollectionResponse>(
      "/store/payment-collections",
      {
        config,
        method: "POST",
        body: {
          cart_id: cartId,
        },
      }
    )

  return payment_collection
}

export async function prepareManualPayment(
  cart: StoreCart,
  config?: CartClientConfig
) {
  const providers = await listPaymentProviders(cart.region_id, config)
  const paymentProvider = selectPaymentProvider(providers, config)

  if (!paymentProvider) {
    throw new MedusaStorefrontError(
      "No enabled Medusa payment provider is available for this region."
    )
  }

  const paymentCollection = await createPaymentCollection(cart.id, config)
  const { payment_collection } =
    await medusaCartFetch<StorePaymentCollectionResponse>(
      `/store/payment-collections/${paymentCollection.id}/payment-sessions`,
      {
        config,
        method: "POST",
        body: {
          provider_id: paymentProvider.id,
        },
      }
    )

  return payment_collection
}

export async function completeCart(config?: CartClientConfig) {
  const cartId = getRequiredCartId()
  const response = await medusaCartFetch<CompleteCartResponse>(
    `/store/carts/${cartId}/complete`,
    {
      config,
      method: "POST",
    }
  )

  if (response.type === "order") {
    clearCartId()
  }

  return response
}

export async function getOrderById(orderId: string, config?: CartClientConfig) {
  const { order } = await medusaCartFetch<StoreOrderResponse>(
    `/store/orders/${orderId}`,
    {
      config,
    }
  )

  return order
}

export function formatMockOrderNumber(orderId: string) {
  return `AP-${orderId.replace("order_", "").slice(-8).toUpperCase()}`
}

export function formatCartMoney(amount: number, currencyCode: string) {
  return formatCurrency(amount, currencyCode)
}
