import Link from "next/link"
import { ArrowRight, PackageCheck, Pencil, ShoppingBag, Truck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const summaryItems = [
  {
    title: "Everyday pencils",
    description: "Reliable graphite, color, and sketching tools for home, studio, and school.",
    icon: Pencil,
  },
  {
    title: "Fast browsing",
    description: "A clean product catalogue makes it easy to compare options and choose quickly.",
    icon: PackageCheck,
  },
  {
    title: "Simple checkout",
    description: "Cart, delivery details, and order placement stay focused and card-free.",
    icon: Truck,
  },
]

export default function BootstrapPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-16 sm:px-10">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge>AllPencils</Badge>
            <Badge variant="secondary">Stationery</Badge>
            <Badge variant="secondary">Ready to ship</Badge>
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Pencils for sharper notes, sketches, and everyday ideas.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Browse a focused range of writing and drawing tools, add favorites to
              your cart, and place an order without entering card details.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/products">
                Browse the catalogue
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/cart">
                View cart
                <ShoppingBag className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Order at your pace</CardTitle>
            <CardDescription>
              Keep browsing, review quantities, and complete checkout when your cart
              feels right.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Products stay organized by use, price, and variant.</p>
            <p>Cart totals update as you adjust quantities.</p>
            <p>Checkout collects only contact and delivery details.</p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="grid gap-4 md:grid-cols-3">
        {summaryItems.map(({ title, description, icon: Icon }) => (
          <Card key={title} className="border-border/70 bg-card/85">
            <CardHeader className="gap-3">
              <div className="flex size-10 items-center justify-center rounded-full border border-border/60 bg-background/80">
                <Icon className="size-4 text-primary" />
              </div>
              <div className="space-y-1">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>
    </main>
  )
}
