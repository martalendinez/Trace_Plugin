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
    /* -------------------------------------------------------
       STEP 2 → STEP 3 (Generate Critiques)
    -------------------------------------------------------- */
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
          anythingElse: state.anythingElse,
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

    /* -------------------------------------------------------
       STEP 3 → STEP 4 (Generate Improvements ALWAYS)
    -------------------------------------------------------- */
    if (action.type === "NEXT_STEP" && state.currentStep === 3) {
      baseDispatch({ type: "SET_LOADING", loading: true });

      try {
        const selectedOption = state.generatedOptions.find(
          (o) => o.id === state.selectedOptionId
        );

        const res = await fetch(
          "http://localhost:3001/api/reflect/improvements",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              goal: state.goal,
              audience: state.audience,
              productContext: state.productContext,
              designStage: state.designStage,
              contextSelection: state.contextSelection,
              selectedOption,
            }),
          }
        );

        const text = await res.text();
        const data = text ? JSON.parse(text) : { improvements: [] };

        baseDispatch({
          type: "SET_IMPROVEMENTS",
          improvements: data.improvements || [],
        });

        baseDispatch({ type: "SET_STEP", step: 4 });
      } catch (err) {
        console.error("Improvements API error:", err);
      } finally {
        baseDispatch({ type: "SET_LOADING", loading: false });
      }

      return;
    }

    /* -------------------------------------------------------
       DEFAULT NEXT_STEP (no async)
    -------------------------------------------------------- */
    if (action.type === "NEXT_STEP") {
      baseDispatch({
        type: "SET_STEP",
        step: state.currentStep + 1,
      });
      return;
    }

    /* -------------------------------------------------------
       DEFAULT DISPATCH
    -------------------------------------------------------- */
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
