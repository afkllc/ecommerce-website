export type AssistantChoice = {
  id: "artist" | "school" | "work" | "fallback"
  label: string
  prompt: string
  response: string
  href: string
}

export const assistantIntro =
  "Tell me what you need the pencil for and I will suggest a useful starting point."

export const assistantChoices: AssistantChoice[] = [
  {
    id: "artist",
    label: "Art or sketching",
    prompt: "I am drawing or sketching.",
    response:
      "Start with pencils that offer tonal range and control. Softer graphite and color options are usually best for expressive marks.",
    href: "/products",
  },
  {
    id: "school",
    label: "School or study",
    prompt: "I need pencils for school.",
    response:
      "Choose durable everyday pencils that write cleanly, erase well, and handle diagrams, notes, and practice work.",
    href: "/products",
  },
  {
    id: "work",
    label: "Work or planning",
    prompt: "I need pencils for work.",
    response:
      "Look for comfortable pencils with consistent lines for planning, marking, editing, and focused desk work.",
    href: "/products",
  },
  {
    id: "fallback",
    label: "I am not sure",
    prompt: "I am not sure yet.",
    response:
      "Begin with a balanced everyday pencil, then add specialist options once you know whether you need darker marks, color, or long-session comfort.",
    href: "/products",
  },
]
