import { useEffect } from "react";
import { PluginShell } from "../components/layout/PluginShell";
import {
  ReflectionProvider,
  useReflection,
} from "../features/reflection/state/ReflectionContext";

import { IntentStep } from "../components/steps/IntentStep";
import { ContextStep } from "../components/steps/ContextStep";
import { OptionsStep } from "../components/steps/OptionsStep";
import { RefineOptionStep } from "../components/steps/RefineOptionStep";
import { CritiqueStep } from "../components/steps/CritiqueStep";
import { CritiqueChatStep } from "../components/steps/CritiqueChatStep";
import { ApplyStep } from "../components/steps/ApplyStep";
import { TraceStep } from "../components/steps/TraceStep";

function CurrentStep() {
  const { state } = useReflection();

  if (state.isRefinementPageOpen) return <RefineOptionStep />;
  if (state.isCritiqueChatOpen) return <CritiqueChatStep />;

  switch (state.currentStep) {
    case 0:
      return <IntentStep />;
    case 1:
      return <ContextStep />;
    case 2:
      return <OptionsStep />;
    case 3:
      return <CritiqueStep />;
    case 4:
      return <ApplyStep />;
    case 5:
      return <TraceStep />;
    default:
      return <IntentStep />;
  }
}

function InnerApp() {
  const { dispatch, state } = useReflection();

  // ⭐ Listen for messages from Figma (selection updates)
  useEffect(() => {
    window.onmessage = (event) => {
      const msg = event.data?.pluginMessage;
      if (!msg) return;

      if (msg.type === "SELECTION_CHANGED") {
        const payload = msg.payload;

        if (!payload) {
          dispatch({
            type: "SET_FIELD",
            field: "selectedElement",
            value: "",
          });
          return;
        }

        dispatch({
          type: "SET_FIELD",
          field: "selectedElement",
          value: payload.name ?? "",
        });

        // Optional: store ID for future canvas updates
        dispatch({
          type: "SET_FIELD",
          field: "selectedElementId",
          value: payload.id,
        });
      }
    };
  }, [dispatch]);

  return (
    <PluginShell>
      <div key={state.currentStep}>
        <CurrentStep />
      </div>
    </PluginShell>
  );
}

export default function App() {
  return (
    <ReflectionProvider>
      <InnerApp />
    </ReflectionProvider>
  );
}
