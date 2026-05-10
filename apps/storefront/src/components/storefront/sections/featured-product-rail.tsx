import Link from "next/link"

import { ProductCard } from "@/components/product-card"
import type { StoreProduct } from "@/lib/medusa"

type FeaturedProductRailProps = {
  products: StoreProduct[]
  currencyCode: string
}

export function FeaturedProductRail({
  products,
  currencyCode,
}: FeaturedProductRailProps) {
  if (!products.length) {
    return null
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-medium uppercase text-primary">
            Featured pencils
          </p>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Selected pencils that show the collection in motion.
          </h2>
        </div>
        <Link
          href="/products"
          className="w-fit border-b border-primary py-2 text-sm font-medium text-primary transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        >
          View catalogue
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            currencyCode={currencyCode}
          />
        ))}
      </div>
    </section>
  )
}
