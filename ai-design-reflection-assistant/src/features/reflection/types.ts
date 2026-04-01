export type StepId =
  | "intent"
  | "context"
  | "options"
  | "critique"
  | "apply"
  | "trace";

export type TaskMode =
  | "generate-ideas"
  | "critique-design"
  | "improve-accessibility"
  | "write-ux-copy"
  | "plan-interaction";

export type DesignStage =
  | "research"
  | "wireframe"
  | "early-concept"
  | "high-fidelity";

export type ContextItem =
  | "selected-ui"
  | "button-labels"
  | "input-fields"
  | "user-research"
  | "internal-docs";

export type CritiqueCategory =
  | "accessibility"
  | "edge-cases"
  | "interaction-complexity"
  | "consistency"
  | "usability";

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

export interface CritiqueItem {
  id: string;
  category: CritiqueCategory;
  title: string;
  concern: string;
  suggestion: string;
  uncertaintyNote: string;
}

export interface TraceEntry {
  label: string;
  value: string;
}

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

  ownImprovement: string;
  appliedChanges: string[];
}
