import type { craftPoints } from "@/data/homepage"

type CraftStripProps = {
  items: typeof craftPoints
}

export function CraftStrip({ items }: CraftStripProps) {
  return (
    <section className="grid gap-4 border-y border-border/70 py-6 md:grid-cols-3">
      {items.map(({ title, description, icon: Icon }) => (
        <div key={title} className="space-y-3">
          <div className="flex size-9 items-center justify-center rounded-lg border border-border/60 bg-card">
            <Icon className="size-4 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      ))}
    </section>
  )
}
