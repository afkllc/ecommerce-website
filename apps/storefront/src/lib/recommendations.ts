import type { StoreProduct } from "@/lib/medusa"

export type RecommendationUseCase = "artist" | "school" | "work"

const USE_CASE_KEYWORDS: Record<RecommendationUseCase, string[]> = {
  artist: ["artist", "art", "sketch", "draw", "shade", "blend", "color", "colour"],
  school: ["school", "student", "study", "class", "exam", "note"],
  work: ["work", "office", "desk", "planning", "editing", "focus"],
}

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function getProductSignals(product: StoreProduct) {
  return [
    product.title,
    product.description ?? "",
    product.metadata?.audience ?? "",
    product.metadata?.story ?? "",
    ...(product.metadata?.recommendation_tags ?? []),
    ...(product.categories?.map((category) => category.name) ?? []),
  ]
    .map(normalize)
    .join(" ")
}

export function inferProductUseCases(product: StoreProduct): RecommendationUseCase[] {
  const signals = getProductSignals(product)

  return (Object.entries(USE_CASE_KEYWORDS) as Array<
    [RecommendationUseCase, string[]]
  >)
    .filter(([, keywords]) => keywords.some((keyword) => signals.includes(keyword)))
    .map(([useCase]) => useCase)
}

export function getProductsForUseCase(
  products: StoreProduct[],
  useCase: RecommendationUseCase,
  limit = 3
) {
  const matches = products.filter((product) =>
    inferProductUseCases(product).includes(useCase)
  )
  const fallback = products.filter((product) => !matches.includes(product))

  return [...matches, ...fallback].slice(0, limit)
}

export function getRelatedProducts(
  product: StoreProduct,
  products: StoreProduct[],
  limit = 3
) {
  const candidates = products.filter((candidate) => candidate.id !== product.id)
  const productUseCases = inferProductUseCases(product)
  const productCategoryIds = new Set(product.categories?.map((category) => category.id))
  const productTags = new Set(product.metadata?.recommendation_tags ?? [])

  const ranked = candidates
    .map((candidate, index) => {
      const candidateUseCases = inferProductUseCases(candidate)
      const candidateCategoryIds = candidate.categories?.map((category) => category.id) ?? []
      const candidateTags = candidate.metadata?.recommendation_tags ?? []

      const score =
        candidateUseCases.filter((useCase) => productUseCases.includes(useCase)).length * 4 +
        candidateCategoryIds.filter((id) => productCategoryIds.has(id)).length * 3 +
        candidateTags.filter((tag) => productTags.has(tag)).length * 2

      return { candidate, index, score }
    })
    .sort((left, right) => right.score - left.score || left.index - right.index)

  return ranked.map((entry) => entry.candidate).slice(0, limit)
}

export function getFeaturedProducts(products: StoreProduct[], limit = 4) {
  return products.slice(0, limit)
}
