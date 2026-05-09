"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Minus, Plus, Trash2 } from "lucide-react"

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
import { formatCartMoney } from "@/lib/medusa"

export default function CartPage() {
  const router = useRouter()
  const {
    cart,
    itemCount,
    subtotal,
    isLoading,
    error,
    beginCheckout,
    removeItem,
    updateItemQuantity,
  } = useCart()

  async function handleCheckout() {
    const canContinue = await beginCheckout()

    if (canContinue) {
      router.push("/checkout")
    }
  }

  if (isLoading && !cart) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12 sm:px-10">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Loading cart</CardTitle>
            <CardDescription>
              Restoring your saved cart.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12 sm:px-10">
        <section className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge>Cart</Badge>
            <Badge variant="secondary">Ready when you are</Badge>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Your cart is ready whenever you are.
          </h1>
        </section>

        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>No items yet</CardTitle>
            <CardDescription>
              Add a product from the catalogue to start checkout.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href="/products">Browse products</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Back home</Link>
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
          <Badge>Cart</Badge>
          <Badge variant="secondary">{itemCount} item{itemCount === 1 ? "" : "s"}</Badge>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Review your cart before checkout.
          </h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            Adjust quantities, remove items, or continue to checkout when your
            selection looks right.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-4">
          {cart.items.map((item) => (
            <Card key={item.id} className="border-border/70 bg-card/90">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border/70 bg-muted sm:w-36">
                  {item.thumbnail ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(min-width: 640px) 9rem, 100vw"
                    />
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h2 className="text-xl font-semibold">{item.title}</h2>
                        <p className="text-sm text-muted-foreground">
                          {item.variant_title ?? "Selected variant"}
                        </p>
                        {item.product_handle ? (
                          <Link
                            href={`/products/${item.product_handle}`}
                            className="text-sm text-primary underline-offset-4 hover:underline"
                          >
                            View product
                          </Link>
                        ) : null}
                      </div>
                      <p className="text-lg font-semibold">
                        {formatCartMoney(item.total ?? item.subtotal ?? item.unit_price, cart.currency_code)}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Unit price: {formatCartMoney(item.unit_price, cart.currency_code)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Decrease quantity for ${item.title}`}
                        disabled={isLoading || item.quantity <= 1}
                        onClick={() => void updateItemQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="size-3.5" />
                      </Button>
                      <span className="min-w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Increase quantity for ${item.title}`}
                        disabled={isLoading}
                        onClick={() => void updateItemQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isLoading}
                      onClick={() => void removeItem(item.id)}
                    >
                      <Trash2 className="size-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Cart summary</CardTitle>
            <CardDescription>
              Shipping is applied in the next step from available delivery options.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Items</span>
              <span>{itemCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCartMoney(subtotal, cart.currency_code)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>Applied in checkout</span>
            </div>
            <div className="flex items-center justify-between border-t border-border/70 pt-4 text-base font-semibold">
              <span>Total today</span>
              <span>{formatCartMoney(cart.total, cart.currency_code)}</span>
            </div>
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
            <Button
              type="button"
              size="lg"
              className="w-full"
              disabled={isLoading}
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>
            <Button asChild type="button" variant="outline" className="w-full">
              <Link href="/products">Keep shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
