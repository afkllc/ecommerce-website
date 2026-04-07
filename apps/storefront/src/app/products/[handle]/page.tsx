import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

import { ProductVariantPicker } from "@/components/product-variant-picker"
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
import {
  MEDUSA_STORE_REVALIDATE_SECONDS,
  formatCurrency,
  getStoreProductByHandle,
  getProductPrimaryImage,
  getProductPrice,
} from "@/lib/medusa"

export const revalidate = MEDUSA_STORE_REVALIDATE_SECONDS

type ProductDetailPageProps = {
  params: {
    handle: string
  }
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const productResult = await getStoreProductByHandle(params.handle)

  if (productResult.status === "not-found") {
    notFound()
  }

  if (productResult.status !== "ready") {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12 sm:px-10">
        <Button asChild variant="outline" className="w-fit">
          <Link href="/products">
            <ArrowLeft className="size-4" />
            Back to products
          </Link>
        </Button>
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Product unavailable</CardTitle>
            <CardDescription>
              The storefront could not load this Medusa product yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {productResult.message}
          </CardContent>
        </Card>
      </main>
    )
  }

  const { data: product, region } = productResult
  const image = getProductPrimaryImage(product)
  const category = product.categories?.[0]?.name ?? "Pencil"

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 sm:px-10">
      <Button asChild variant="outline" className="w-fit">
        <Link href="/products">
          <ArrowLeft className="size-4" />
          Back to products
        </Link>
      </Button>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border/70 bg-muted">
            {image ? (
              <Image
                src={image}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 55vw, 100vw"
                priority
              />
            ) : null}
          </div>
          {product.images.length > 1 ? (
            <div className="grid grid-cols-2 gap-4">
              {product.images.slice(0, 2).map((entry) => (
                <div
                  key={entry.id ?? entry.url}
                  className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border/70 bg-muted"
                >
                  <Image
                    src={entry.url}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 20vw, 50vw"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge>{category}</Badge>
            {product.metadata?.recommendation_tags?.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                {product.title}
              </h1>
              <p className="text-2xl font-semibold text-primary">
                {formatCurrency(getProductPrice(product), region.currency_code)}
              </p>
            </div>
            <p className="text-base leading-7 text-muted-foreground">
              {product.description}
            </p>
            {product.metadata?.story ? (
              <p className="rounded-2xl border border-border/70 bg-card/70 p-4 text-sm leading-6 text-muted-foreground">
                {product.metadata.story}
              </p>
            ) : null}
          </div>

          <Separator />

          <ProductVariantPicker
            currencyCode={region.currency_code}
            options={product.options.map((option) => ({
              title: option.title,
              values: option.values.map((value) => value.value),
            }))}
            variants={product.variants.map((variant) => ({
              id: variant.id,
              title: variant.title,
              sku: variant.sku,
              inventoryQuantity: variant.inventory_quantity,
              manageInventory: variant.manage_inventory,
              priceAmount: variant.calculated_price?.calculated_amount ?? null,
              optionValues: Object.fromEntries(
                (variant.options ?? []).map((option) => [
                  option.option?.title ?? "",
                  option.value,
                ])
              ),
            }))}
          />

          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle>Why it fits this demo</CardTitle>
              <CardDescription>
                A product detail layout ready for client branding and real cart logic later.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Audience: {product.metadata?.audience ?? "General stationery shoppers"}
              </p>
              <p>
                Route uses ISR with a 60-second revalidation window for fast catalogue
                browsing.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
