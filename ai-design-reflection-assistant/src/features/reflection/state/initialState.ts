import type { ReflectionState } from "../types";

export const initialReflectionState: ReflectionState = {
  currentStep: 0,
  taskMode: "generate-ideas",
  goal: "",
  audience: "",
  maxSteps: 6,

  selectedElement: "",
  productContext: "",

  goalNotes: "",
  audienceNotes: "",
  selectedElementNotes: "",
  productContextNotes: "",

  designerNotes: "",

  designStage: [],
  contextSelection: [],

  generatedOptions: [],
  selectedOptionId: null,

  activeCritiqueCategories: [],
  critiques: [],

  ownImprovement: "",

  improvements: [],
  refinementChat: [],

  appliedChanges: [],

  changeInstructions: [],

  loading: false,
};
