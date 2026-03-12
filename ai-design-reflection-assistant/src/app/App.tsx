import { PluginShell } from "../components/layout/PluginShell";
import { ReflectionProvider, useReflection } from "../features/reflection/state/ReflectionContext";
import { IntentStep } from "../components/steps/IntentStep";
import { ContextStep } from "../components/steps/ContextStep";
import { OptionsStep } from "../components/steps/OptionsStep";
import { CritiqueStep } from "../components/steps/CritiqueStep";
import { ApplyStep } from "../components/steps/ApplyStep";
import { TraceStep } from "../components/steps/TraceStep";

function CurrentStep() {
  const { state } = useReflection();

  switch (state.currentStep) {
    case 1:
      return <IntentStep />;
    case 2:
      return <ContextStep />;
    case 3:
      return <OptionsStep />;
    case 4:
      return <CritiqueStep />;
    case 5:
      return <ApplyStep />;
    case 6:
      return <TraceStep />;
    default:
      return <IntentStep />;
  }
}

export default function App() {
  return (
    <ReflectionProvider>
      <PluginShell>
        <CurrentStep />
      </PluginShell>
    </ReflectionProvider>
  );
}