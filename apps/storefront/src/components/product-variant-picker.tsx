"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/medusa"

type ProductVariantPickerProps = {
  currencyCode: string
  options: {
    title: string
    values: string[]
  }[]
  variants: {
    id: string
    title: string
    sku?: string | null
    inventoryQuantity?: number
    manageInventory?: boolean
    priceAmount: number | null
    optionValues: Record<string, string>
  }[]
}

export function ProductVariantPicker({
  currencyCode,
  options,
  variants,
}: ProductVariantPickerProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        options.map((option) => [option.title, option.values[0] ?? ""])
      )
  )

  const selectedVariant = useMemo(() => {
    return (
      variants.find((variant) =>
        Object.entries(selectedOptions).every(
          ([optionTitle, selectedValue]) =>
            variant.optionValues[optionTitle] === selectedValue
        )
      ) ?? variants[0]
    )
  }, [selectedOptions, variants])

  return (
    <div className="space-y-6">
      {options.map((option) => (
        <div key={option.title} className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium">{option.title}</p>
            <p className="text-sm text-muted-foreground">
              {selectedOptions[option.title]}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const isSelected = selectedOptions[option.title] === value

              return (
                <Button
                  key={value}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setSelectedOptions((current) => ({
                      ...current,
                      [option.title]: value,
                    }))
                  }
                >
                  {value}
                </Button>
              )
            })}
          </div>
        </div>
      ))}

      <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {selectedVariant?.title ?? "Selected variant"}
            </p>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {selectedVariant?.sku ?? "SKU pending"}
            </p>
          </div>
          <p className="text-lg font-semibold">
            {formatCurrency(selectedVariant?.priceAmount ?? null, currencyCode)}
          </p>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {selectedVariant?.manageInventory
            ? `${selectedVariant.inventoryQuantity ?? 0} units ready to ship`
            : "Inventory is available for this demo selection."}
        </p>
      </div>

      <Button type="button" size="lg" className="w-full" disabled>
        Add to cart arrives in Phase 2
      </Button>
    </div>
  )
}
