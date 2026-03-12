import type { CritiqueItem } from "../types";

export const critiqueLibrary: CritiqueItem[] = [
  {
    id: "c1",
    category: "accessibility",
    title: "Potential accessibility impact",
    concern:
      "Hidden or progressively revealed fields may not be announced clearly to assistive technologies.",
    suggestion:
      "Add explicit labels, preserve focus order, and announce newly revealed inputs.",
    uncertaintyNote:
      "This may matter more if fields are dynamically inserted or visually hidden.",
  },
  {
    id: "c2",
    category: "edge-cases",
    title: "New users may need more guidance",
    concern:
      "If onboarding relies only on placeholders, users may still hesitate or enter incomplete data.",
    suggestion:
      "Add helper text that explains why the field matters and what valid input looks like.",
    uncertaintyNote:
      "This depends on how familiar users already are with the product domain.",
  },
  {
    id: "c3",
    category: "interaction-complexity",
    title: "Too many steps can increase effort",
    concern:
      "Breaking the flow into too many moments may reduce overwhelm but also increase friction.",
    suggestion:
      "Keep the sequence short and show visible progress so the extra steps feel manageable.",
    uncertaintyNote:
      "This risk grows if users are forced through multiple screens for simple input.",
  },
  {
    id: "c4",
    category: "consistency",
    title: "Interaction pattern may conflict with existing flows",
    concern:
      "If this screen behaves differently from the rest of the product, users may lose confidence.",
    suggestion:
      "Match existing field patterns, copy tone, and button placement where possible.",
    uncertaintyNote:
      "This matters most when the product already has established interaction patterns.",
  },
  {
    id: "c5",
    category: "usability",
    title: "Primary action may compete visually",
    concern:
      "If the main CTA looks too similar to secondary actions, the next step may feel unclear.",
    suggestion:
      "Increase prominence of the primary action through spacing, grouping, or stronger emphasis.",
    uncertaintyNote:
      "This depends on the actual visual hierarchy of the selected UI.",
  },
];