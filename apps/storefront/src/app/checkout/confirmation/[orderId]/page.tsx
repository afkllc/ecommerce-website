import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  formatCartMoney,
  formatMockOrderNumber,
  getOrderById,
} from "@/lib/medusa"

export const dynamic = "force-dynamic"

type CheckoutConfirmationPageProps = {
  params: {
    orderId: string
  }
}

export default async function CheckoutConfirmationPage({
  params,
}: CheckoutConfirmationPageProps) {
  try {
    const order = await getOrderById(params.orderId)

    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12 sm:px-10">
        <section className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge>Order placed</Badge>
            <Badge variant="secondary">Card-free checkout</Badge>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Your order is confirmed.
            </h1>
            <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
              Your cart was completed using available shipping and payment options,
              and the cart session is ready for your next visit.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>{formatMockOrderNumber(order.id)}</CardTitle>
              <CardDescription>
                Order reference for your records.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono text-xs uppercase tracking-[0.2em]">
                  {order.id}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Email</span>
                <span>{order.email ?? "Not provided"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Status</span>
                <span className="capitalize">{order.status ?? "pending"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCartMoney(order.subtotal, order.currency_code)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatCartMoney(order.shipping_total, order.currency_code)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-3 text-base font-semibold">
                <span>Total</span>
                <span>{formatCartMoney(order.total, order.currency_code)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>Checkout summary</CardTitle>
              <CardDescription>
                Your order was placed without entering card details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>A shipping option was applied automatically.</p>
              <p>
                The checkout used an enabled payment provider, so no raw card data
                was collected by the storefront.
              </p>
              {order.items?.length ? (
                <div className="space-y-3 rounded-2xl border border-border/70 bg-background/50 p-4">
                  <p className="font-medium text-foreground">Included items</p>
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-foreground">{item.title}</p>
                        <p>{item.subtitle ?? "Selected variant"} x {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/products">Continue shopping</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/cart">Open cart</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    )
  } catch (error) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12 sm:px-10">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Order confirmation unavailable</CardTitle>
            <CardDescription>
              The storefront could not retrieve this order right now.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "The confirmation route is waiting on the order service."}
            </p>
            <Button asChild>
              <Link href="/products">Back to products</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }
}
