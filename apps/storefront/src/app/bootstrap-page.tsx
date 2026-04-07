import Link from "next/link"
import { ArrowRight, FolderKanban, PackageCheck, ServerCog } from "lucide-react"

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
    description: "A pnpm monorepo now owns the storefront, backend, and shared setup notes.",
    icon: FolderKanban,
  },
  {
    title: "Storefront",
    description: "Next.js 14, Tailwind, and shadcn/ui are ready without making live Medusa requests.",
    icon: PackageCheck,
  },
  {
    title: "Backend",
    description: "Medusa v2 is scaffolded with env-only configuration and no database bootstrap shortcuts.",
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
            <Badge>Task 0</Badge>
            <Badge variant="secondary">Next.js 14</Badge>
            <Badge variant="secondary">Medusa v2</Badge>
            <Badge variant="secondary">pnpm workspace</Badge>
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              AllPencils is bootstrapped for the next Phase 0 checkpoint.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              The repo now has a storefront, a backend scaffold, and a documented env
              contract. This checkpoint stops at configuration visibility, so the app can
              start safely before a database or sales channel exists.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/status">
                Review setup status
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Configuration snapshot</CardTitle>
            <CardDescription>
              Task 0 only checks whether the storefront knows enough to describe the next
              setup step.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-background/70 p-3">
              <div>
                <p className="font-medium">Server-side Medusa URL</p>
                <p className="text-sm text-muted-foreground">Used by the service layer later.</p>
              </div>
              {renderStatusLabel(config.canAttemptServerCalls, "Missing")}
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-background/70 p-3">
              <div>
                <p className="font-medium">Client-safe Medusa URL</p>
                <p className="text-sm text-muted-foreground">Required for future browser cart flows.</p>
              </div>
              {renderStatusLabel(config.canAttemptBrowserCalls, "Missing")}
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-background/70 p-3">
              <div>
                <p className="font-medium">Publishable key</p>
                <p className="text-sm text-muted-foreground">
                  Intentionally optional until a sales channel exists.
                </p>
              </div>
              {renderStatusLabel(config.hasPublishableKey, "Deferred")}
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
