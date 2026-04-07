import { ProductCard } from "@/components/product-card"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  MEDUSA_STORE_REVALIDATE_SECONDS,
  listStoreProducts,
} from "@/lib/medusa"

export const revalidate = MEDUSA_STORE_REVALIDATE_SECONDS

export default async function ProductsPage() {
  const catalogue = await listStoreProducts()

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 sm:px-10">
      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge>Phase 1</Badge>
          <Badge variant="secondary">Catalogue</Badge>
          <Badge variant="secondary">ISR 60s</Badge>
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Pencil tools with a clean, client-ready storefront shell.
          </h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            This catalogue is powered by Medusa through the storefront service layer,
            with static generation and revalidation for a fast demo experience.
          </p>
        </div>
      </section>

      {catalogue.status === "ready" ? (
        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {catalogue.data.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              currencyCode={catalogue.region.currency_code}
            />
          ))}
        </section>
      ) : (
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Catalogue unavailable</CardTitle>
            <CardDescription>
              The storefront could not load product data from Medusa yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {catalogue.message}
          </CardContent>
        </Card>
      )}
    </main>
  )
}
