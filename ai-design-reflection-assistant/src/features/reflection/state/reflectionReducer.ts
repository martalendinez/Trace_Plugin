import type { ReflectionState } from "../types";

export function reflectionReducer(
  state: ReflectionState,
  action: any
): ReflectionState {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };

    case "SET_STEP":
      return {
        ...state,
        currentStep: action.step,
      };

    case "NEXT_STEP":
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, state.maxSteps - 1),
      };

    default:
      return state;
  }
}
