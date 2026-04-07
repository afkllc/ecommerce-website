import Image from "next/image"
import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  formatCurrency,
  getProductPrice,
  getProductPrimaryImage,
  type StoreProduct,
} from "@/lib/medusa"

type ProductCardProps = {
  product: StoreProduct
  currencyCode: string
}

export function ProductCard({ product, currencyCode }: ProductCardProps) {
  const image = getProductPrimaryImage(product)
  const category = product.categories?.[0]?.name ?? "Pencil"
  const audience = product.metadata?.audience ?? "Everyday use"

  return (
    <Card className="overflow-hidden border-border/70 bg-card/90 transition-transform hover:-translate-y-0.5">
      <Link href={`/products/${product.handle}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
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
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span>{category}</span>
          <span>{formatCurrency(getProductPrice(product), currencyCode)}</span>
        </div>
        <CardTitle className="text-xl">
          <Link href={`/products/${product.handle}`}>{product.title}</Link>
        </CardTitle>
        <CardDescription>{audience}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
          {product.description}
        </p>
      </CardContent>
    </Card>
  )
}
