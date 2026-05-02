import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type PropsWithChildren,
} from "react";

import { initialReflectionState } from "./initialState";
import { reflectionReducer } from "./reflectionReducer";
import type { ReflectionState } from "../types";
import { callReflectApi } from "../../../lib/reflectApi";

type ReflectionAction = Parameters<typeof reflectionReducer>[1];

interface ReflectionContextValue {
  state: ReflectionState;
  dispatch: Dispatch<ReflectionAction>;
}

const ReflectionContext = createContext<ReflectionContextValue | null>(null);

export function ReflectionProvider({ children }: PropsWithChildren) {
  const [state, baseDispatch] = useReducer(
    reflectionReducer,
    initialReflectionState
  );

  // ⭐ Wrapped dispatch with async logic
  const dispatch: Dispatch<ReflectionAction> = async (action) => {
    // Intercept NEXT_STEP → Critique (step 2 → 3)
    if (action.type === "NEXT_STEP" && state.currentStep === 2) {
      baseDispatch({ type: "SET_LOADING", loading: true });

      try {
        const selectedOption = state.generatedOptions.find(
          (o) => o.id === state.selectedOptionId
        );

        const payload = {
          goal: state.goal,
          audience: state.audience,
          productContext: state.productContext,
          designStage: state.designStage,
          contextSelection: state.contextSelection,
          selectedOption,
          activeCritiqueCategories: state.activeCritiqueCategories,
        };

        const result = await callReflectApi(payload);

        baseDispatch({
          type: "SET_REFLECTION_RESULT",
          payload: result,
        });

        baseDispatch({ type: "SET_STEP", step: 3 });
      } catch (err) {
        console.error("Reflection API error:", err);
      } finally {
        baseDispatch({ type: "SET_LOADING", loading: false });
      }

      return;
    }

    // Normal dispatch for all other actions
    baseDispatch(action);
  };

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <ReflectionContext.Provider value={value}>
      {children}
    </ReflectionContext.Provider>
  );
}

export function useReflection() {
  const context = useContext(ReflectionContext);
  if (!context) {
    throw new Error("useReflection must be used inside ReflectionProvider");
  }
  return context;
}
