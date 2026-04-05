import type { ReflectionState } from "../types";

export const initialReflectionState: ReflectionState = {
  currentStep: 0,
  taskMode: "generate-ideas",
  goal: "",
  audience: "",
  maxSteps: 7,

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

  improvements: [],

  ownImprovement: "",

  refinementChat: [],
  isRefinementPageOpen: false,
  optionBeingRefined: null,
  refinedOptionDraft: null,

  /** NEW */
  isCritiqueChatOpen: false,
  critiqueBeingDiscussed: null,
  critiqueChat: [],
  refinedCritiqueSuggestion: null,

  appliedChanges: [],
  changeInstructions: [],

  loading: false,
};
