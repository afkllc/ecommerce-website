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
  cardholder: string
  cardNumber: string
  expiry: string
  cvc: string
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
  cardholder: "",
  cardNumber: "",
  expiry: "",
  cvc: "",
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
      cardholder: "",
      cardNumber: "",
      expiry: "",
      cvc: "",
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
    const normalizedCardNumber = formValues.cardNumber.replace(/\s+/g, "")

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

    if (!formValues.cardholder) {
      return "Add the simulated cardholder name to continue."
    }

    if (!/^\d{16}$/.test(normalizedCardNumber)) {
      return "Use a 16-digit simulated card number."
    }

    if (!/^\d{2}\/\d{2}$/.test(formValues.expiry)) {
      return "Use an expiry in MM/YY format."
    }

    if (!/^\d{3,4}$/.test(formValues.cvc)) {
      return "Use a 3 or 4 digit simulated CVC."
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
              Reconnecting to your saved cart before we place the demo order.
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
              Add at least one product before using the simulated checkout flow.
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
          <Badge>Phase 2</Badge>
          <Badge variant="secondary">Checkout</Badge>
          <Badge variant="secondary">Simulated card form</Badge>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Complete the demo checkout.
          </h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            This form validates contact details locally, auto-applies the verified
            Standard Shipping option, initializes the default Medusa system payment,
            and completes a real order without sending card data anywhere.
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
                These details are saved to the Medusa cart before checkout completes.
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
                Country choices are limited to the seeded Medusa region for this demo.
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
              <CardTitle>Simulated card details</CardTitle>
              <CardDescription>
                Demo only. No real payment data is processed or sent to Stripe in this
                phase.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="cardholder">Cardholder name</Label>
                <Input
                  id="cardholder"
                  value={formValues.cardholder}
                  onChange={(event) => updateField("cardholder", event.target.value)}
                  placeholder="Ada Pencil"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="cardNumber">Card number</Label>
                <Input
                  id="cardNumber"
                  inputMode="numeric"
                  value={formValues.cardNumber}
                  onChange={(event) => updateField("cardNumber", event.target.value)}
                  placeholder="4242424242424242"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry</Label>
                <Input
                  id="expiry"
                  value={formValues.expiry}
                  onChange={(event) => updateField("expiry", event.target.value)}
                  placeholder="12/34"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  inputMode="numeric"
                  value={formValues.cvc}
                  onChange={(event) => updateField("cvc", event.target.value)}
                  placeholder="123"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
            <CardDescription>
              Standard Shipping is auto-applied during submission using the verified live
              shipping option name.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                  <div className="space-y-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-muted-foreground">
                      {item.variant_title ?? "Demo variant"} x {item.quantity}
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
              <span>Standard Shipping added on submit</span>
            </div>
            <div className="flex items-center justify-between border-t border-border/70 pt-4 text-base font-semibold">
              <span>Total after checkout</span>
              <span>Calculated by Medusa on order placement</span>
            </div>
            {formError ? (
              <p className="text-sm text-destructive">{formError}</p>
            ) : null}
            {!formError && error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? "Placing order..." : "Place Demo Order"}
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
