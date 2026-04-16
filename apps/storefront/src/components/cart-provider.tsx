"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import {
  CART_STORAGE_KEY,
  DEFAULT_SHIPPING_OPTION_NAME,
  MedusaStorefrontError,
  addLineItem,
  applyShippingMethod,
  clearCartId,
  completeCart,
  ensureCart,
  getCartId,
  listCartShippingOptions,
  prepareManualPayment,
  removeLineItem,
  retrieveCart,
  setCartAddresses,
  setCartEmail,
  updateLineItem,
  type StoreCart,
  type StoreCartAddress,
  type StoreOrder,
} from "@/lib/medusa"

type CheckoutDetails = {
  email: string
  shippingAddress: StoreCartAddress
  billingAddress: StoreCartAddress
}

type CartContextValue = {
  cart: StoreCart | null
  itemCount: number
  subtotal: number
  isLoading: boolean
  error: string | null
  refreshCart: () => Promise<StoreCart | null>
  addItem: (variantId: string, quantity?: number) => Promise<StoreCart>
  updateItemQuantity: (lineItemId: string, quantity: number) => Promise<StoreCart>
  removeItem: (lineItemId: string) => Promise<StoreCart>
  beginCheckout: () => Promise<boolean>
  completeCheckout: (details: CheckoutDetails) => Promise<StoreOrder>
}

type CartProviderProps = {
  children: ReactNode
  publishableKey: string | null
}

const CartContext = createContext<CartContextValue | null>(null)

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return "The cart could not be updated right now."
}

export function CartProvider({
  children,
  publishableKey,
}: CartProviderProps) {
  const [cart, setCart] = useState<StoreCart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const config = {
    publishableKey,
  }

  const refreshCart = useCallback(async () => {
    const cartId = getCartId()

    if (!publishableKey) {
      setCart(null)
      setError("MEDUSA_PUBLISHABLE_KEY is missing from the storefront runtime.")
      setIsLoading(false)
      return null
    }

    if (!cartId) {
      setCart(null)
      setError(null)
      setIsLoading(false)
      return null
    }

    setIsLoading(true)

    try {
      const nextCart = await retrieveCart(cartId, config)

      setCart(nextCart)
      setError(null)

      return nextCart
    } catch (caughtError) {
      if (
        caughtError instanceof MedusaStorefrontError &&
        caughtError.status === 404
      ) {
        clearCartId()
        setCart(null)
        setError(null)

        return null
      }

      setCart(null)
      setError(getErrorMessage(caughtError))

      return null
    } finally {
      setIsLoading(false)
    }
  }, [publishableKey])

  async function addItem(variantId: string, quantity = 1) {
    setIsLoading(true)

    try {
      const nextCart = await addLineItem(
        {
          variantId,
          quantity,
        },
        config
      )

      setCart(nextCart)
      setError(null)

      return nextCart
    } catch (caughtError) {
      const message = getErrorMessage(caughtError)

      setError(message)
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  async function updateItemQuantity(lineItemId: string, quantity: number) {
    setIsLoading(true)

    try {
      const nextCart = await updateLineItem(lineItemId, quantity, config)

      setCart(nextCart)
      setError(null)

      return nextCart
    } catch (caughtError) {
      const message = getErrorMessage(caughtError)

      setError(message)
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  async function removeItem(lineItemId: string) {
    setIsLoading(true)

    try {
      const nextCart = await removeLineItem(lineItemId, config)

      setCart(nextCart)
      setError(null)

      return nextCart
    } catch (caughtError) {
      const message = getErrorMessage(caughtError)

      setError(message)
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  async function beginCheckout() {
    const nextCart = await refreshCart()

    if (!nextCart || nextCart.items.length === 0) {
      setError("Add at least one product before starting checkout.")
      return false
    }

    setError(null)
    return true
  }

  async function completeCheckout(details: CheckoutDetails) {
    setIsLoading(true)

    try {
      let workingCart = await ensureCart(config)

      if (workingCart.items.length === 0) {
        throw new Error("Your cart is empty. Add a product before checkout.")
      }

      workingCart = await setCartEmail(details.email, config)
      workingCart = await setCartAddresses(
        {
          shippingAddress: details.shippingAddress,
          billingAddress: details.billingAddress,
        },
        config
      )

      const shippingOptions = await listCartShippingOptions(config)
      const defaultShippingOption = shippingOptions.find(
        (option) => option.name === DEFAULT_SHIPPING_OPTION_NAME
      )

      if (!defaultShippingOption) {
        throw new Error(
          `The default shipping option "${DEFAULT_SHIPPING_OPTION_NAME}" is unavailable.`
        )
      }

      if (
        !workingCart.shipping_methods.some(
          (method) => method.shipping_option_id === defaultShippingOption.id
        )
      ) {
        workingCart = await applyShippingMethod(defaultShippingOption.id, config)
      }

      await prepareManualPayment(workingCart, config)

      const completion = await completeCart(config)

      if (completion.type !== "order") {
        throw new Error(
          completion.error?.message ?? "Medusa could not complete the cart."
        )
      }

      setCart(null)
      setError(null)

      return completion.order
    } catch (caughtError) {
      const message = getErrorMessage(caughtError)

      setError(message)
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void refreshCart()
  }, [refreshCart])

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === CART_STORAGE_KEY) {
        void refreshCart()
      }
    }

    window.addEventListener("storage", handleStorage)

    return () => {
      window.removeEventListener("storage", handleStorage)
    }
  }, [refreshCart])

  const value: CartContextValue = {
    cart,
    itemCount:
      cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0,
    subtotal: cart?.subtotal ?? 0,
    isLoading,
    error,
    refreshCart,
    addItem,
    updateItemQuantity,
    removeItem,
    beginCheckout,
    completeCheckout,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error("useCart must be used within the CartProvider.")
  }

  return context
}
