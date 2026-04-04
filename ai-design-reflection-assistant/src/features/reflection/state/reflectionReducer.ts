import type {
  ReflectionState,
  DesignStage,
  ContextItem,
  OptionCard,
  CritiqueCategory,
  CritiqueItem,
  ChangeInstruction,
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
    // OPTIONS
    // -----------------------------
    // (No more mock GENERATE_OPTIONS — options now come from AI)
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

    case "REMOVE_CRITIQUE":
      return {
        ...state,
        critiques: state.critiques.filter((c) => c.id !== action.id),
      };

    // -----------------------------
    // IMPROVEMENTS
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
    // OWN IMPROVEMENT
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
    // CHANGE INSTRUCTIONS
    // -----------------------------
    case "SET_CHANGE_INSTRUCTIONS":
      return {
        ...state,
        changeInstructions: action.value as ChangeInstruction[],
      };

    // -----------------------------
    // BACKEND INTEGRATION
    // -----------------------------
    case "SET_LOADING":
      return { ...state, loading: action.loading };

    case "SET_REFLECTION_RESULT":
      return {
        ...state,
        generatedOptions: action.payload.options as OptionCard[],
        // keep selectedOptionId if still valid, otherwise reset
        selectedOptionId: state.selectedOptionId,
        critiques: action.payload.critiques as CritiqueItem[],
        improvements: action.payload.improvements,
        changeInstructions: action.payload.changeInstructions,
      };

    default:
      return state;
  }
}
