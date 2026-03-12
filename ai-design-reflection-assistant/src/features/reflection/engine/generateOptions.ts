import type { OptionCard } from "../types";

export function generateOptions(goal: string, audience: string): OptionCard[] {
  const goalLabel = goal || "improve onboarding clarity";
  const audienceLabel = audience || "first-time users";

  return [
    {
      id: "option-1",
      title: "Guided onboarding",
      summary: `Short step-by-step guidance for ${audienceLabel}.`,
      problem: "Users feel unsure what to enter.",
      assumption: `Users need explicit guidance to achieve the goal: ${goalLabel}.`,
      principle: "Recognition over recall",
      tradeoff: "Adds more interface text and can increase visual density.",
      suggestedChanges: [
        "Add helper text below key inputs.",
        "Group related fields into short sections.",
        "Make the primary CTA more visually distinct.",
      ],
    },
    {
      id: "option-2",
      title: "Progressive disclosure",
      summary: `Reveal information gradually to reduce cognitive load for ${audienceLabel}.`,
      problem: "Users are overwhelmed by too many fields at once.",
      assumption: "Reducing visible complexity helps users begin faster.",
      principle: "Progressive disclosure",
      tradeoff: "Can hide important information and reduce scanability.",
      suggestedChanges: [
        "Show only the first essential field initially.",
        "Reveal advanced inputs after early progress.",
        "Add progress feedback so the flow still feels predictable.",
      ],
    },
    {
      id: "option-3",
      title: "Example-based onboarding",
      summary: `Use examples to clarify input expectations for ${audienceLabel}.`,
      problem: "Users do not know what a correct answer looks like.",
      assumption: "Examples reduce hesitation and clarify expectations.",
      principle: "Example-driven guidance",
      tradeoff: "Examples may look like pre-filled values if styled poorly.",
      suggestedChanges: [
        'Use a clear placeholder like "example@email.com".',
        "Add a short helper note explaining field purpose.",
        "Pair examples with accessible labels.",
      ],
    },
  ];
}