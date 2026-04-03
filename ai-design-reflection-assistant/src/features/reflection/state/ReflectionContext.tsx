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

// Infer the action type from the reducer signature
type ReflectionAction = Parameters<typeof reflectionReducer>[1];

interface ReflectionContextValue {
  state: ReflectionState;
  dispatch: Dispatch<ReflectionAction>;
}

const ReflectionContext = createContext<ReflectionContextValue | null>(null);

export function ReflectionProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(
    reflectionReducer,
    initialReflectionState
  );

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
