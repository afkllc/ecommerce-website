import Link from "next/link"
import {
  ArrowRight,
  FolderKanban,
  PackageCheck,
  PencilLine,
  ServerCog,
} from "lucide-react"

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
import { getMedusaConfigStatus } from "@/lib/medusa"

const summaryItems = [
  {
    title: "Workspace",
    description: "One root repo now owns the storefront, backend, and shared setup notes.",
    icon: FolderKanban,
  },
  {
    title: "Storefront",
    description: "Next.js 14 now renders a real Medusa-backed catalogue with ISR.",
    icon: PackageCheck,
  },
  {
    title: "Backend",
    description: "Medusa v2 is seeded with a six-product pencil demo on the live backend.",
    icon: ServerCog,
  },
]

function renderStatusLabel(isReady: boolean, missingLabel: string) {
  if (isReady) {
    return <Badge variant="secondary">Configured</Badge>
  }

  return <Badge variant="outline">{missingLabel}</Badge>
}

export default function BootstrapPage() {
  const config = getMedusaConfigStatus()

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-16 sm:px-10">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge>Phase 1</Badge>
            <Badge variant="secondary">Catalogue</Badge>
            <Badge variant="secondary">Medusa Store API</Badge>
            <Badge variant="secondary">ISR 60s</Badge>
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              AllPencils now ships a live pencil catalogue with room to grow into a client template.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              The storefront can now browse seeded Medusa products end-to-end through the
              service layer. This phase keeps the shell lean while the cart and homepage
              storytelling stay scoped for later work.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/products">
                Browse the catalogue
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/status">
                Review environment status
                <PencilLine className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Storefront snapshot</CardTitle>
            <CardDescription>
              The catalogue stays data-driven, and the env contract still makes it easy to
              see what is powering the live store.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-background/70 p-3">
              <div>
                <p className="font-medium">Server-side Medusa URL</p>
                <p className="text-sm text-muted-foreground">Used by the storefront service layer.</p>
              </div>
              {renderStatusLabel(config.canAttemptServerCalls, "Missing")}
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-background/70 p-3">
              <div>
                <p className="font-medium">Client-safe Medusa URL</p>
                <p className="text-sm text-muted-foreground">Reserved for future browser cart flows.</p>
              </div>
              {renderStatusLabel(config.canAttemptBrowserCalls, "Missing")}
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-background/70 p-3">
              <div>
                <p className="font-medium">Publishable key</p>
                <p className="text-sm text-muted-foreground">Required for live product browsing.</p>
              </div>
              {renderStatusLabel(config.hasPublishableKey, "Missing")}
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="grid gap-4 md:grid-cols-3">
        {summaryItems.map(({ title, description, icon: Icon }) => (
          <Card key={title} className="border-border/70 bg-card/85">
            <CardHeader className="gap-3">
              <div className="flex size-10 items-center justify-center rounded-full border border-border/60 bg-background/80">
                <Icon className="size-4 text-primary" />
              </div>
              <div className="space-y-1">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>
    </main>
  )
}
