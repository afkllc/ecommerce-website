"use client"

import Link from "next/link"
import { Pencil, ShoppingBag } from "lucide-react"

import { useCart } from "@/components/cart-provider"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  const { itemCount } = useCart()

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-10">
        <Link
          href="/"
          className="flex items-center gap-3 text-sm font-semibold tracking-[0.2em] text-foreground uppercase"
        >
          <span className="clip-chamfer flex size-10 items-center justify-center border border-border/70 bg-card">
            <Pencil className="size-4" />
          </span>
          AllPencils
        </Link>

        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/products">Products</Link>
          </Button>
          <Button asChild variant="outline" size="icon-sm">
            <Link href="/cart" aria-label={`Cart with ${itemCount} item${itemCount === 1 ? "" : "s"}`}>
              <span className="relative">
                <ShoppingBag className="size-4" />
                <span className="absolute -top-2 -right-2 inline-flex min-w-4 items-center justify-center bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {itemCount}
                </span>
              </span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
