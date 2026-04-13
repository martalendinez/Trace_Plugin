import type { ReflectionState } from "../types";

export const initialReflectionState: ReflectionState = {
  currentStep: 0,

  taskMode: "generate-ideas",
  goal: "",
  audience: "",
  maxSteps: 7,

  selectedElement: "",
  selectedElementId: "",   // ⭐ REQUIRED for Figma selection sync
  productContext: "",

  goalNotes: "",
  audienceNotes: "",
  selectedElementNotes: "",
  productContextNotes: "",

  designerNotes: "",

  designStage: [],
  contextSelection: [],

  // ⭐ NEW — this is where all extracted Figma data goes
  extractedContext: null,

  generatedOptions: [],
  selectedOptionId: null,

  activeCritiqueCategories: [],
  critiques: [],

  improvements: [],

  ownImprovement: "",

  /* OPTION REFINEMENT */
  refinementChat: [],
  isRefinementPageOpen: false,
  optionBeingRefined: null,
  refinedOptionDraft: null,

  /* CRITIQUE CHAT */
  isCritiqueChatOpen: false,
  critiqueBeingDiscussed: null,
  critiqueChat: [],
  refinedCritiqueSuggestion: null,

  /* APPLY + TRACE */
  appliedChanges: [],
  changeInstructions: [],

  loading: false,
};
