import { ShoppingAssistant } from "@/components/storefront/assistant/shopping-assistant"
import { assistantTeaser } from "@/data/homepage"

export function AssistantTeaser() {
  return (
    <section
      id="assistant"
      className="rounded-lg border border-border/70 bg-card/90 p-6"
    >
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-medium uppercase text-primary">
            {assistantTeaser.eyebrow}
          </p>
          <h2 className="text-3xl font-semibold">{assistantTeaser.title}</h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            {assistantTeaser.description}
          </p>
        </div>
        <ShoppingAssistant triggerLabel={assistantTeaser.cta} />
      </div>
    </section>
  )
}
