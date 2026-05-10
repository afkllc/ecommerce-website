import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { useCases } from "@/data/homepage"

type UseCaseGridProps = {
  items: typeof useCases
}

export function UseCaseGrid({ items }: UseCaseGridProps) {
  return (
    <section className="space-y-5">
      <div className="max-w-2xl space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">Shop by use</p>
        <h2 className="text-3xl font-semibold sm:text-4xl">
          Shop by the work your pencil needs to do.
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map(({ id, title, description, href, icon: Icon, tags }) => (
          <Card key={id} className="clip-chamfer border-border/70 bg-card/90 transition-transform hover:-translate-y-1">
            <CardHeader className="gap-4">
              <div className="flex size-10 items-center justify-center rounded-lg border border-border/60 bg-background">
                <Icon className="size-4 text-primary" />
              </div>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm leading-6 text-muted-foreground">
                {description}
              </p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border/60 px-2 py-1 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href={href}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary"
              >
                Explore {title.toLowerCase()} picks
                <ArrowRight className="size-3" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
