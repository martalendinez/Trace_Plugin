import type { ReflectionState } from "../types";

export const initialReflectionState: ReflectionState = {
  currentStep: 0,

  // ✅ UPDATED: must match new TaskMode
  taskMode: "design",

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