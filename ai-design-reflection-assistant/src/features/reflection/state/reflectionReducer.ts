import type { ReflectionState, DesignStage, ContextItem, OptionCard } from "../types";

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

    // Direct step change
    case "SET_STEP":
      return {
        ...state,
        currentStep: action.step,
      };

    // Move forward
    case "NEXT_STEP":
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, state.maxSteps - 1),
      };

    // Move backward
    case "PREV_STEP":
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 0),
      };

    // Toggle design stage
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

    // Toggle context selection
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

    // ⭐ Generate new options
    case "GENERATE_OPTIONS": {
      // You can replace this with your real AI generation later
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

    // ⭐ Select an option
    case "SELECT_OPTION":
      return {
        ...state,
        selectedOptionId: action.value,
      };

    default:
      return state;
  }
}
