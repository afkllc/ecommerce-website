import { BookOpen, BriefcaseBusiness, Brush, Gauge, Layers3, Sparkles } from "lucide-react"

export const homepageHero = {
  eyebrow: "Premium storefront template",
  title: "A cinematic product shop built to feel bespoke.",
  description:
    "AllPencils pairs a luxury product hero with guided commerce, so buyers see the craft before they reach the catalogue.",
  primaryCta: {
    label: "Shop the collection",
    href: "/products",
  },
  secondaryCta: {
    label: "Explore guided picks",
    href: "#assistant",
  },
  highlights: ["3D product theatre", "Guided buying paths", "No-card checkout demo"],
}

export const useCases = [
  {
    id: "artist",
    title: "Artist",
    description:
      "Sketching pencils, rich color, and controlled marks for studies, drafts, and finished pieces.",
    href: "/products",
    icon: Brush,
    tags: ["Sketch", "Shade", "Blend"],
  },
  {
    id: "school",
    title: "School",
    description:
      "Reliable pencils for notes, diagrams, exams, and daily classroom work.",
    href: "/products",
    icon: BookOpen,
    tags: ["Notes", "Diagrams", "Practice"],
  },
  {
    id: "work",
    title: "Work",
    description:
      "Focused writing tools for planning, marking, editing, and keeping ideas moving.",
    href: "/products",
    icon: BriefcaseBusiness,
    tags: ["Planning", "Editing", "Focus"],
  },
] as const

export const craftPoints = [
  {
    title: "Grade matters",
    description: "Pick harder graphite for clean lines or softer grades for tonal sketching.",
    icon: Gauge,
  },
  {
    title: "Built for repetition",
    description: "Comfortable shapes and dependable cores help long sessions feel easier.",
    icon: Layers3,
  },
  {
    title: "Guided picks",
    description: "Use-case recommendations help shoppers choose without guessing.",
    icon: Sparkles,
  },
] as const

export const assistantTeaser = {
  eyebrow: "Guided shopping",
  title: "Not sure where to start?",
  description:
    "Answer one quick prompt and get a practical starting point for art, school, or work.",
  cta: "Open pencil guide",
}
