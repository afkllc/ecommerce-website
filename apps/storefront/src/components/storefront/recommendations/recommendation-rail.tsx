import { RecommendationCard } from "@/components/storefront/recommendations/recommendation-card"
import type { StoreProduct } from "@/lib/medusa"

type RecommendationRailProps = {
  eyebrow?: string
  title: string
  description?: string
  products: StoreProduct[]
  currencyCode: string
}

export function RecommendationRail({
  eyebrow,
  title,
  description,
  products,
  currencyCode,
}: RecommendationRailProps) {
  if (!products.length) {
    return null
  }

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h2>
          {description ? (
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <RecommendationCard
            key={product.id}
            product={product}
            currencyCode={currencyCode}
          />
        ))}
      </div>
    </section>
  )
}
