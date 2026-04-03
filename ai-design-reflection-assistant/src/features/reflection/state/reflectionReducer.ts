import type {
  ReflectionState,
  DesignStage,
  ContextItem,
  OptionCard,
  CritiqueCategory,
  CritiqueItem,
  ChangeInstruction, // ⭐ NEW
} from "../types";

export function reflectionReducer(
  state: ReflectionState,
  action: any
): ReflectionState {
  switch (action.type) {
    // -----------------------------
    // GENERIC FIELD SETTERS
    // -----------------------------
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };

    case "SET_STEP":
      return { ...state, currentStep: action.step };

    case "NEXT_STEP":
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, state.maxSteps - 1),
      };

    case "PREV_STEP":
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 0),
      };

    // -----------------------------
    // DESIGN STAGE & CONTEXT
    // -----------------------------
    case "TOGGLE_STAGE": {
      const value: DesignStage = action.value;
      const exists = state.designStage.includes(value);
      return {
        ...state,
        designStage: exists
          ? state.designStage.filter((s) => s !== value)
          : [...state.designStage, value],
      };
    }

    case "TOGGLE_CONTEXT": {
      const value: ContextItem = action.value;
      const exists = state.contextSelection.includes(value);
      return {
        ...state,
        contextSelection: exists
          ? state.contextSelection.filter((c) => c !== value)
          : [...state.contextSelection, value],
      };
    }

    // -----------------------------
    // OPTIONS GENERATION
    // -----------------------------
    case "GENERATE_OPTIONS": {
      const mockOptions: OptionCard[] = [
        {
          id: "guided_onboarding",
          title: "Guided onboarding",
          summary: "Short step-by-step guidance for first-time users.",
          problem: "Users feel overwhelmed when too many fields appear at once.",
          assumption: "Breaking tasks into steps reduces cognitive load.",
          principle: "Progressive disclosure",
          tradeoff: "More steps may increase total time.",
          suggestedChanges: [],
        },
        {
          id: "progressive_disclosure",
          title: "Progressive disclosure",
          summary: "Show only essential fields upfront.",
          problem: "Users abandon when forms feel too long.",
          assumption: "Most users only need the basic path.",
          principle: "Simplicity first",
          tradeoff: "Advanced users may need extra clicks.",
          suggestedChanges: [],
        },
        {
          id: "contextual_tooltips",
          title: "Contextual tooltips",
          summary: "Inline hints appear next to each input.",
          problem: "Terminology may be unfamiliar.",
          assumption: "Inline help reduces confusion.",
          principle: "Just-in-time guidance",
          tradeoff: "Too many tooltips can feel noisy.",
          suggestedChanges: [],
        },
      ];

      return {
        ...state,
        generatedOptions: mockOptions,
        selectedOptionId: null,
      };
    }

    case "SELECT_OPTION":
      return { ...state, selectedOptionId: action.value };

    // -----------------------------
    // CRITIQUE
    // -----------------------------
    case "TOGGLE_CRITIQUE_CATEGORY": {
      const value: CritiqueCategory = action.value;
      const exists = state.activeCritiqueCategories.includes(value);
      return {
        ...state,
        activeCritiqueCategories: exists
          ? state.activeCritiqueCategories.filter((c) => c !== value)
          : [...state.activeCritiqueCategories, value],
      };
    }

    case "RUN_CRITIQUE": {
      if (state.activeCritiqueCategories.length === 0) {
        return { ...state, critiques: [] };
      }

      const mockCritiques: CritiqueItem[] = state.activeCritiqueCategories.map(
        (cat) => ({
          id: crypto.randomUUID(),
          category: cat,
          title: `Issue related to ${cat}`,
          concern: `A potential concern in the area of ${cat}.`,
          suggestion: `A suggested improvement for ${cat}.`,
          uncertaintyNote: "This critique may not apply in all contexts.",
        })
      );

      return { ...state, critiques: mockCritiques };
    }

    case "REMOVE_CRITIQUE":
      return {
        ...state,
        critiques: state.critiques.filter((c) => c.id !== action.id),
      };

    // -----------------------------
    // IMPROVEMENTS (Critique → Apply)
    // -----------------------------
    case "ADD_IMPROVEMENT":
      return {
        ...state,
        improvements: [
          ...state.improvements,
          { id: crypto.randomUUID(), text: action.text, applied: false },
        ],
      };

    case "TOGGLE_IMPROVEMENT_APPLIED":
      return {
        ...state,
        improvements: state.improvements.map((imp) =>
          imp.id === action.id ? { ...imp, applied: !imp.applied } : imp
        ),
      };

    // -----------------------------
    // REFINEMENT CHAT
    // -----------------------------
    case "ADD_REFINEMENT_MESSAGE":
      return {
        ...state,
        refinementChat: [...state.refinementChat, action.message],
      };

    // -----------------------------
    // OWN IMPROVEMENT (textarea)
    // -----------------------------
    case "ADD_OWN_IMPROVEMENT":
      if (!state.ownImprovement.trim()) return state;
      return {
        ...state,
        improvements: [
          ...state.improvements,
          {
            id: crypto.randomUUID(),
            text: state.ownImprovement.trim(),
            applied: false,
          },
        ],
        ownImprovement: "",
      };

    // -----------------------------
    // ⭐ NEW: SET CHANGE INSTRUCTIONS
    // -----------------------------
    case "SET_CHANGE_INSTRUCTIONS":
      return {
        ...state,
        changeInstructions: action.value as ChangeInstruction[],
      };

    // -----------------------------
    // DEFAULT
    // -----------------------------
    default:
      return state;
  }
}
