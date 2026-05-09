"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { useCart } from "@/components/cart-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCartMoney, type StoreCartAddress } from "@/lib/medusa"

type CheckoutFormValues = {
  firstName: string
  lastName: string
  email: string
  address1: string
  address2: string
  city: string
  postalCode: string
  countryCode: string
}

const EMPTY_FORM: CheckoutFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  address1: "",
  address2: "",
  city: "",
  postalCode: "",
  countryCode: "",
}

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, isLoading, error, completeCheckout } = useCart()
  const [formValues, setFormValues] = useState<CheckoutFormValues>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [hydratedCartId, setHydratedCartId] = useState<string | null>(null)

  useEffect(() => {
    if (!cart || hydratedCartId === cart.id) {
      return
    }

    setFormValues({
      firstName: cart.shipping_address?.first_name ?? "",
      lastName: cart.shipping_address?.last_name ?? "",
      email: cart.email ?? "",
      address1: cart.shipping_address?.address_1 ?? "",
      address2: cart.shipping_address?.address_2 ?? "",
      city: cart.shipping_address?.city ?? "",
      postalCode: cart.shipping_address?.postal_code ?? "",
      countryCode:
        cart.shipping_address?.country_code ?? cart.region?.countries?.[0]?.iso_2 ?? "",
    })
    setHydratedCartId(cart.id)
  }, [cart, hydratedCartId])

  function updateField<Key extends keyof CheckoutFormValues>(
    field: Key,
    value: CheckoutFormValues[Key]
  ) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function validateCheckout() {
    if (
      !formValues.firstName ||
      !formValues.lastName ||
      !formValues.email ||
      !formValues.address1 ||
      !formValues.city ||
      !formValues.postalCode ||
      !formValues.countryCode
    ) {
      return "Complete the required contact and address fields before placing the order."
    }

    return null
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationMessage = validateCheckout()

    if (validationMessage) {
      setFormError(validationMessage)
      return
    }

    if (!cart) {
      setFormError("Your cart is empty. Add a product before checkout.")
      return
    }

    setFormError(null)

    const address: StoreCartAddress = {
      first_name: formValues.firstName,
      last_name: formValues.lastName,
      address_1: formValues.address1,
      address_2: formValues.address2 || null,
      city: formValues.city,
      postal_code: formValues.postalCode,
      country_code: formValues.countryCode,
    }

    try {
      const order = await completeCheckout({
        email: formValues.email,
        shippingAddress: address,
        billingAddress: address,
      })

      router.push(`/checkout/confirmation/${order.id}`)
    } catch {
      // The provider already stores the API error for display.
    }
  }

  if (isLoading && !cart) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12 sm:px-10">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Loading checkout</CardTitle>
            <CardDescription>
              Reconnecting to your saved cart before order placement.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12 sm:px-10">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Checkout needs a cart</CardTitle>
            <CardDescription>
              Add at least one product before using checkout.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/products">Browse products</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/cart">Back to cart</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12 sm:px-10">
      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Checkout</Badge>
          <Badge variant="secondary">No card collection</Badge>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Complete checkout.
          </h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            Enter contact and delivery details. The store applies an available
            shipping option and completes the order without collecting card data.
          </p>
        </div>
      </section>

      <form
        className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"
        onSubmit={handleSubmit}
      >
        <div className="space-y-6">
          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>Contact details</CardTitle>
              <CardDescription>
                These details are saved to your cart before checkout completes.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={formValues.firstName}
                  onChange={(event) => updateField("firstName", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={formValues.lastName}
                  onChange={(event) => updateField("lastName", event.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formValues.email}
                  onChange={(event) => updateField("email", event.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>Shipping address</CardTitle>
              <CardDescription>
                Country choices are limited to the active delivery region.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address1">Address line 1</Label>
                <Input
                  id="address1"
                  value={formValues.address1}
                  onChange={(event) => updateField("address1", event.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address2">Address line 2</Label>
                <Input
                  id="address2"
                  value={formValues.address2}
                  onChange={(event) => updateField("address2", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formValues.city}
                  onChange={(event) => updateField("city", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal code</Label>
                <Input
                  id="postalCode"
                  value={formValues.postalCode}
                  onChange={(event) => updateField("postalCode", event.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="countryCode">Country</Label>
                <Select
                  value={formValues.countryCode}
                  onValueChange={(value) => updateField("countryCode", value)}
                >
                  <SelectTrigger id="countryCode" className="w-full">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {cart.region?.countries?.map((country) => (
                      <SelectItem key={country.iso_2} value={country.iso_2}>
                        {country.display_name ?? country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>Payment</CardTitle>
              <CardDescription>
                Card details are not collected. Payment is initialized through an
                enabled provider for this cart region.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">
                Order placement continues only after a shipping option and enabled
                payment provider are available for the cart.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
            <CardDescription>
              Shipping and payment are selected from available checkout options.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                  <div className="space-y-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-muted-foreground">
                      {item.variant_title ?? "Selected variant"} x {item.quantity}
                    </p>
                  </div>
                  <p>{formatCartMoney(item.total ?? item.unit_price, cart.currency_code)}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-border/70 pt-4 text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCartMoney(cart.subtotal, cart.currency_code)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>Added on submit</span>
            </div>
            <div className="flex items-center justify-between border-t border-border/70 pt-4 text-base font-semibold">
              <span>Total after checkout</span>
              <span>Calculated on order placement</span>
            </div>
            {formError ? (
              <p className="text-sm text-destructive">{formError}</p>
            ) : null}
            {!formError && error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? "Placing order..." : "Place order"}
            </Button>
            <Button asChild type="button" variant="outline" className="w-full">
              <Link href="/cart">Back to cart</Link>
            </Button>
          </CardContent>
        </Card>
      </form>
    </main>
  )
}
