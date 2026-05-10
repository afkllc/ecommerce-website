import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  formatCurrency,
  getProductPrice,
  getProductPrimaryImage,
  type StoreProduct,
} from "@/lib/medusa"

type RecommendationCardProps = {
  product: StoreProduct
  currencyCode: string
}

export function RecommendationCard({
  product,
  currencyCode,
}: RecommendationCardProps) {
  const image = getProductPrimaryImage(product)
  const audience = product.metadata?.audience ?? product.categories?.[0]?.name ?? "Pencil"

  return (
    <Card className="clip-chamfer h-full overflow-hidden border-border/70 bg-card/90 transition-transform hover:-translate-y-0.5">
      <Link href={`/products/${product.handle}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {image ? (
            <Image
              src={image}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            />
          ) : null}
        </div>
      </Link>
      <CardHeader className="gap-2">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {audience}
        </p>
        <CardTitle className="text-base">
          <Link href={`/products/${product.handle}`}>{product.title}</Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3 pt-0 text-sm">
        <span className="font-medium text-primary">
          {formatCurrency(getProductPrice(product), currencyCode)}
        </span>
        <Link
          href={`/products/${product.handle}`}
          className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          View
          <ArrowRight className="size-3" />
        </Link>
      </CardContent>
    </Card>
  )
}
