export type StepId =
  | "intent"
  | "context"
  | "options"
  | "refine-option"
  | "critique"
  | "critique-chat"
  | "apply"
  | "trace";

/* -----------------------------
   TASK + CONTEXT TYPES
----------------------------- */

export type TaskMode =
  | "design"
  | "evaluation"
  | "research"
  | "content"
  | "strategy";

/* -----------------------------
   UPDATED DESIGN STAGES
----------------------------- */

export type DesignStage =
  | "problem-definition"
  | "user-flows"
  | "low-fidelity"
  | "wireframe"
  | "mid-fidelity"
  | "high-fidelity"
  | "prototype"
  | "usability-testing";

/* -----------------------------
   CONTEXT ITEMS
----------------------------- */

export type ContextItem =
  | "selected-ui"
  | "button-labels"
  | "input-fields"
  | "user-research"
  | "internal-docs";

/* -----------------------------
   OPTIONS
----------------------------- */

export interface OptionCard {
  id: string;
  title: string;
  summary: string;
  problem: string;
  assumption: string;
  principle: string;
  tradeoff: string;
  suggestedChanges: string[];
}

/* -----------------------------
   CRITIQUES
----------------------------- */

export type CritiqueCategory =
  | "accessibility"
  | "edge-cases"
  | "interaction-complexity"
  | "consistency"
  | "usability";

export interface CritiqueItem {
  id: string;
  category: CritiqueCategory;
  title: string;
  concern: string;
  suggestion: string;
  uncertaintyNote: string;
}

/* -----------------------------
   CHAT
----------------------------- */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/* -----------------------------
   IMPROVEMENTS
----------------------------- */

export interface ImprovementItem {
  id: string;
  text: string;
  applied: boolean;
}

/* -----------------------------
   MAIN REFLECTION STATE
----------------------------- */

export interface ReflectionState {
  currentStep: number;

  taskMode: TaskMode;
  goal: string;
  audience: string;
  maxSteps: number;

  selectedElement: string;
  productContext: string;

  goalNotes: string;
  audienceNotes: string;
  selectedElementNotes: string;
  productContextNotes: string;

  designerNotes: string;

  designStage: DesignStage[];
  contextSelection: ContextItem[];

  generatedOptions: OptionCard[];
  selectedOptionId: string | null;

  activeCritiqueCategories: CritiqueCategory[];
  critiques: CritiqueItem[];

  improvements: ImprovementItem[];

  ownImprovement: string;

  /* OPTION REFINEMENT */
  refinementChat: ChatMessage[];
  isRefinementPageOpen: boolean;
  optionBeingRefined: OptionCard | null;
  refinedOptionDraft: OptionCard | null;

  /* CRITIQUE CHAT */
  isCritiqueChatOpen: boolean;
  critiqueBeingDiscussed: CritiqueItem | null;
  critiqueChat: ChatMessage[];
  refinedCritiqueSuggestion: string | null;

  /* APPLY + TRACE */
  appliedChanges: string[];
  changeInstructions: any[];

  loading?: boolean;

  /* UI DROPDOWNS */
  designStageDropdown?: boolean;

  /* ⭐ NEW FIELDS */
  anythingElse: string;

  /* ⭐ AI REASONING FOR OPTIONS */
  reasoning: string;
}
