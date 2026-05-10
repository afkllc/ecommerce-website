import { RecommendationRail } from "@/components/storefront/recommendations/recommendation-rail"
import { LuxuryHero } from "@/components/storefront/hero/luxury-hero"
import { AssistantTeaser } from "@/components/storefront/sections/assistant-teaser"
import { CraftStrip } from "@/components/storefront/sections/craft-strip"
import { FeaturedProductRail } from "@/components/storefront/sections/featured-product-rail"
import { UseCaseGrid } from "@/components/storefront/sections/use-case-grid"
import { craftPoints, homepageHero, useCases } from "@/data/homepage"
import {
  MEDUSA_STORE_REVALIDATE_SECONDS,
  listStoreProducts,
} from "@/lib/medusa"
import { getFeaturedProducts, getProductsForUseCase } from "@/lib/recommendations"

export const revalidate = MEDUSA_STORE_REVALIDATE_SECONDS

export default async function HomePage() {
  const catalogue = await listStoreProducts()

  if (catalogue.status !== "ready") {
    return (
      <main className="overflow-hidden">
        <LuxuryHero hero={homepageHero} />
        <div
          id="storefront-sections"
          className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 sm:px-10"
        >
          <UseCaseGrid items={useCases} />
          <CraftStrip items={craftPoints} />
          <AssistantTeaser />
        </div>
      </main>
    )
  }

  const featuredProducts = getFeaturedProducts(catalogue.data, 4)
  const recommendedProducts = getProductsForUseCase(catalogue.data, "artist", 3)

  return (
    <main className="overflow-hidden">
      <LuxuryHero hero={homepageHero} />
      <div
        id="storefront-sections"
        className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 py-12 sm:px-10"
      >
        <UseCaseGrid items={useCases} />
        <FeaturedProductRail
          products={featuredProducts}
          currencyCode={catalogue.region.currency_code}
        />
        <CraftStrip items={craftPoints} />
        <RecommendationRail
          eyebrow="Recommended starting points"
          title="A few useful picks if you are choosing quickly."
          description="Selected from available product signals for sketching, school, and focused work."
          products={recommendedProducts}
          currencyCode={catalogue.region.currency_code}
        />
        <AssistantTeaser />
      </div>
    </main>
  )
}
