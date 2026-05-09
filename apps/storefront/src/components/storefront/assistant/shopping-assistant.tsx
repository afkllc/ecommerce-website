"use client"

import * as React from "react"
import Link from "next/link"
import { MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { assistantChoices, assistantIntro } from "@/data/assistant-script"

type ShoppingAssistantProps = {
  triggerLabel?: string
}

export function ShoppingAssistant({
  triggerLabel = "Open pencil guide",
}: ShoppingAssistantProps) {
  const [selectedId, setSelectedId] = React.useState(assistantChoices[0]?.id)
  const selected =
    assistantChoices.find((choice) => choice.id === selectedId) ??
    assistantChoices[0]

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="lg">
          {triggerLabel}
          <MessageCircle className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Pencil guide</SheetTitle>
          <SheetDescription>{assistantIntro}</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-4">
          <div className="grid gap-2">
            {assistantChoices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => setSelectedId(choice.id)}
                className="rounded-lg border border-border/70 bg-background p-3 text-left text-sm transition-colors hover:bg-muted data-[active=true]:border-primary"
                data-active={choice.id === selected?.id}
              >
                <span className="font-medium">{choice.label}</span>
                <span className="mt-1 block text-muted-foreground">
                  {choice.prompt}
                </span>
              </button>
            ))}
          </div>
          {selected ? (
            <div className="space-y-3 rounded-lg border border-border/70 bg-card p-4">
              <p className="text-sm leading-6 text-muted-foreground">
                {selected.response}
              </p>
              <Button asChild variant="outline">
                <Link href={selected.href}>Browse suggested pencils</Link>
              </Button>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
