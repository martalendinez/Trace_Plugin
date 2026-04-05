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
      return <CritiqueChatStep />;
    case 5:
      return <ApplyStep />;
    case 6:
      return <TraceStep />;
    default:
      return <IntentStep />;
  }
}

function InnerApp() {
  const { state } = useReflection();

  return (
    <PluginShell>
      {/* Key forces remount + smooth transitions */}
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
