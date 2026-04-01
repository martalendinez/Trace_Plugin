import type { ReflectionState, DesignStage, ContextItem } from "../types";

export function reflectionReducer(
  state: ReflectionState,
  action: any
): ReflectionState {
  switch (action.type) {
    // Generic field setter
    case "SET_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };

    // Direct step change (used by StepNavigator)
    case "SET_STEP":
      return {
        ...state,
        currentStep: action.step,
      };

    // Move forward one step
    case "NEXT_STEP":
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, state.maxSteps - 1),
      };

    // Move backward one step
    case "PREV_STEP":
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 0),
      };

    // Toggle design stage (research, wireframe, etc.)
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

    // Toggle context selection (selected-ui, button-labels, etc.)
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

    default:
      return state;
  }
}
