import type { ReflectionState } from "../types";

export const initialReflectionState: ReflectionState = {
  currentStep: 1,
  taskMode: "generate-ideas",
  goal: "Improve onboarding flow",
  audience: "First-time users",
  maxSteps: 3,

  selectedElement: "Onboarding screen - Figma Frame",
  productContext: "Fitness tracking app",
  designerNotes: "This screen appears after account creation.",
  designStage: ["high-fidelity"],
  contextSelection: ["selected-ui", "button-labels", "input-fields"],

  generatedOptions: [],
  selectedOptionId: null,
  activeCritiqueCategories: [
    "accessibility",
    "edge-cases",
    "interaction-complexity",
  ],
  critiques: [],

  ownImprovement: "",
  appliedChanges: [],
};