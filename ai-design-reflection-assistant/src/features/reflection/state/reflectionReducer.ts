import { v4 as uuid } from "uuid";
import type {
  ReflectionState,
  DesignStage,
  ContextItem,
  OptionCard,
  CritiqueCategory,
  CritiqueItem,
} from "../types";

export function reflectionReducer(
  state: ReflectionState,
  action: any
): ReflectionState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };

    case "SET_STEP":
      return { ...state, currentStep: action.step };

    case "NEXT_STEP":
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, 5),
      };

    case "PREV_STEP":
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 0),
      };

    /* DESIGN STAGE + CONTEXT */

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

    /* CRITIQUE CATEGORY FILTERING */

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

    /* OPTION SELECTION + REFLECTION RESULT */

    case "SELECT_OPTION":
      return { ...state, selectedOptionId: action.value };

    case "SET_REFLECTION_RESULT":
      return {
        ...state,
        generatedOptions:
          action.payload.options ?? state.generatedOptions,

        critiques: action.payload.critiques
          ? action.payload.critiques.map((c: CritiqueItem) => ({
              ...c,
              category: c.category.replace(/_/g, "-").toLowerCase(),
            }))
          : state.critiques,

        improvements:
          action.payload.improvements &&
          action.payload.improvements.length > 0
            ? action.payload.improvements
            : state.improvements,

        changeInstructions:
          action.payload.changeInstructions ??
          state.changeInstructions,
      };

    /* ⭐ CRITICAL FIX: independent improvements injection */
    case "SET_IMPROVEMENTS":
      return {
        ...state,
        improvements: action.improvements || [],
      };

    /* OPTION REFINEMENT FLOW */

    case "OPEN_REFINEMENT_PAGE":
      return {
        ...state,
        isRefinementPageOpen: true,
        optionBeingRefined: action.option,
        refinedOptionDraft: null,
        refinementChat: [
          {
            role: "assistant",
            content: "What would you like to improve or explore?",
          },
        ],
      };

    case "CLOSE_REFINEMENT_PAGE":
      return {
        ...state,
        isRefinementPageOpen: false,
        optionBeingRefined: null,
        refinedOptionDraft: null,
        refinementChat: [],
      };

    case "SET_REFINED_OPTION_DRAFT":
      return {
        ...state,
        refinedOptionDraft: action.option,
      };

    case "APPLY_REFINED_OPTION": {
      if (!state.optionBeingRefined || !action.option) return state;

      const base = state.optionBeingRefined;

      const refined: OptionCard = {
        ...action.option,
        id: base.id, // keep identity stable
      };

      return {
        ...state,
        generatedOptions: state.generatedOptions.map((o) =>
          o.id === base.id ? refined : o
        ),
        optionBeingRefined: refined,
        isRefinementPageOpen: false,
        refinedOptionDraft: null,
        refinementChat: [],
      };
    }

    /* CRITIQUE CHAT FLOW */

    case "OPEN_CRITIQUE_CHAT":
      return {
        ...state,
        isCritiqueChatOpen: true,
        critiqueBeingDiscussed: action.critique,
        critiqueChat: [],
        refinedCritiqueSuggestion: null,
      };

    case "CLOSE_CRITIQUE_CHAT":
      return {
        ...state,
        isCritiqueChatOpen: false,
        critiqueBeingDiscussed: null,
        critiqueChat: [],
        refinedCritiqueSuggestion: null,
      };

    case "ADD_CRITIQUE_CHAT_MESSAGE":
      return {
        ...state,
        critiqueChat: [...state.critiqueChat, action.message],
      };

    case "SET_REFINED_CRITIQUE_SUGGESTION":
      return {
        ...state,
        refinedCritiqueSuggestion: action.value,
      };

    /* IMPROVEMENTS + APPLY STEP */

    case "ADD_IMPROVEMENT":
      if (!action.text) return state;

      return {
        ...state,
        improvements: [
          ...state.improvements,
          {
            id: uuid(),
            text: action.text,
            applied: false,
          },
        ],
      };

    case "TOGGLE_IMPROVEMENT_APPLIED":
      return {
        ...state,
        improvements: state.improvements.map((imp) =>
          imp.id === action.id
            ? { ...imp, applied: !imp.applied }
            : imp
        ),
      };

    case "ADD_REFINEMENT_MESSAGE":
      return {
        ...state,
        refinementChat: [...state.refinementChat, action.message],
      };

    case "REMOVE_CRITIQUE":
      return {
        ...state,
        critiques: state.critiques.filter((c) => c.id !== action.id),
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: action.loading,
      };

    default:
      return state;
  }
}