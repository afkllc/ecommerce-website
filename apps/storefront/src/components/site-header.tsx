import Link from "next/link"
import { Pencil, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"

export function SiteHeader() {
  return (
    <header className="border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-10">
        <Link
          href="/"
          className="flex items-center gap-3 text-sm font-semibold tracking-[0.2em] text-foreground uppercase"
        >
          <span className="flex size-10 items-center justify-center rounded-full border border-border/70 bg-card">
            <Pencil className="size-4" />
          </span>
          AllPencils
        </Link>

        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/products">Products</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/status">Status</Link>
          </Button>
          <Button variant="outline" size="icon-sm" aria-label="Cart coming in Phase 2">
            <ShoppingBag className="size-4" />
          </Button>
        </nav>
      </div>
    </header>
  )
}
