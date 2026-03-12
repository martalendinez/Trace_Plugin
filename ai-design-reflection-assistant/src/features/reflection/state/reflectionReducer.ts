import { generateCritiques } from "../engine/generateCritiques";
import { generateOptions } from "../engine/generateOptions";
import type {
  ContextItem,
  CritiqueCategory,
  DesignStage,
  ReflectionState,
} from "../types";

type Action =
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SET_FIELD"; field: keyof ReflectionState; value: unknown }
  | { type: "TOGGLE_STAGE"; value: DesignStage }
  | { type: "TOGGLE_CONTEXT"; value: ContextItem }
  | { type: "TOGGLE_CRITIQUE_CATEGORY"; value: CritiqueCategory }
  | { type: "GENERATE_OPTIONS" }
  | { type: "SELECT_OPTION"; value: string }
  | { type: "RUN_CRITIQUE" }
  | { type: "APPLY_CHANGE"; value: string }
  | { type: "ADD_OWN_IMPROVEMENT" };

export function reflectionReducer(
  state: ReflectionState,
  action: Action
): ReflectionState {
  switch (action.type) {
    case "NEXT_STEP":
      return { ...state, currentStep: Math.min(6, state.currentStep + 1) };

    case "PREV_STEP":
      return { ...state, currentStep: Math.max(1, state.currentStep - 1) };

    case "SET_FIELD":
      return { ...state, [action.field]: action.value } as ReflectionState;

    case "TOGGLE_STAGE": {
      const exists = state.designStage.includes(action.value);
      return {
        ...state,
        designStage: exists
          ? state.designStage.filter((item) => item !== action.value)
          : [...state.designStage, action.value],
      };
    }

    case "TOGGLE_CONTEXT": {
      const exists = state.contextSelection.includes(action.value);
      return {
        ...state,
        contextSelection: exists
          ? state.contextSelection.filter((item) => item !== action.value)
          : [...state.contextSelection, action.value],
      };
    }

    case "TOGGLE_CRITIQUE_CATEGORY": {
      const exists = state.activeCritiqueCategories.includes(action.value);
      return {
        ...state,
        activeCritiqueCategories: exists
          ? state.activeCritiqueCategories.filter((item) => item !== action.value)
          : [...state.activeCritiqueCategories, action.value],
      };
    }

    case "GENERATE_OPTIONS": {
      const generatedOptions = generateOptions(state.goal, state.audience);
      return {
        ...state,
        generatedOptions,
        selectedOptionId: generatedOptions[0]?.id ?? null,
      };
    }

    case "SELECT_OPTION":
      return { ...state, selectedOptionId: action.value };

    case "RUN_CRITIQUE":
      return {
        ...state,
        critiques: generateCritiques(state.activeCritiqueCategories),
      };

    case "APPLY_CHANGE":
      if (state.appliedChanges.includes(action.value)) return state;
      return {
        ...state,
        appliedChanges: [...state.appliedChanges, action.value],
      };

    case "ADD_OWN_IMPROVEMENT": {
      const value = state.ownImprovement.trim();
      if (!value) return state;
      return {
        ...state,
        appliedChanges: [...state.appliedChanges, value],
        ownImprovement: "",
      };
    }

    default:
      return state;
  }
}