import Link from "next/link"
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CircleDashed,
  KeyRound,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getMedusaConfigStatus, getMedusaHealthStatus } from "@/lib/medusa"

function statusBadge(status: "configured" | "missing" | "deferred") {
  if (status === "configured") {
    return <Badge variant="secondary">Configured</Badge>
  }

  if (status === "deferred") {
    return <Badge variant="outline">Deferred</Badge>
  }

  return <Badge variant="outline">Missing</Badge>
}

function healthBadge(status: "healthy" | "not-configured" | "unreachable") {
  if (status === "healthy") {
    return <Badge variant="secondary">Healthy</Badge>
  }

  if (status === "not-configured") {
    return <Badge variant="outline">Not configured</Badge>
  }

  return <Badge variant="outline">Unreachable</Badge>
}

export default async function StatusPage() {
  const config = getMedusaConfigStatus()
  const health = await getMedusaHealthStatus()

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-16 sm:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge>Configuration status</Badge>
            <Badge variant="secondary">Server-side health check</Badge>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Storefront setup visibility
            </h1>
            <p className="max-w-3xl text-base leading-7 text-muted-foreground">
              This page reads the local env contract and attempts a safe server-side Medusa
              `/health` request only when the backend URL is configured. Missing or
              unreachable backends stay visible without crashing the storefront.
            </p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Back to overview
          </Link>
        </Button>
      </div>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Backend health</CardTitle>
            <CardDescription>
              The storefront now checks the backend through `lib/medusa`, but only when the
              server-side base URL exists.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/70 p-3">
              <CheckCircle2 className="mt-0.5 size-4 text-primary" />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">Current backend state</p>
                  {healthBadge(health.status)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {health.message}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/70 p-3">
              <CircleDashed className="mt-0.5 size-4 text-primary" />
              <div className="space-y-1">
                <p className="font-medium">Health URL</p>
                <p className="text-sm text-muted-foreground">
                  {health.url ?? "Set MEDUSA_BACKEND_URL to enable the real check."}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/70 p-3">
              <KeyRound className="mt-0.5 size-4 text-primary" />
              <div className="space-y-1">
                <p className="font-medium">Response summary</p>
                <p className="text-sm text-muted-foreground">
                  {health.httpStatus
                    ? `HTTP ${health.httpStatus}${health.payload ? ` with payload ${JSON.stringify(health.payload)}` : ""}`
                    : "No response was received yet."}
                </p>
              </div>
            </div>
            {health.status === "unreachable" ? (
              <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <AlertCircle className="mt-0.5 size-4 text-destructive" />
                <div className="space-y-1">
                  <p className="font-medium">Graceful failure path works</p>
                  <p className="text-sm text-muted-foreground">
                    The page stayed up and surfaced the failure instead of throwing a runtime
                    error.
                  </p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Env contract</CardTitle>
            <CardDescription>
              The first two keys unlock future storefront API work. The publishable key is
              intentionally deferred.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Purpose</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {config.entries.map((entry) => (
                    <TableRow key={entry.key}>
                      <TableCell className="font-mono text-xs">{entry.key}</TableCell>
                      <TableCell>{statusBadge(entry.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle>What happens next</CardTitle>
          <CardDescription>
            With the Render backend reachable, this page is the first proof that the
            storefront can talk to Medusa through the service layer without introducing
            product or cart logic yet.
          </CardDescription>
        </CardHeader>
      </Card>
    </main>
  )
}
