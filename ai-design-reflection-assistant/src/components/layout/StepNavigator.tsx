import { motion } from "framer-motion";
import {
  Target,
  Layers,
  LayoutGrid,
  MessageSquare,
  Lightbulb,
  FileText,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useReflection } from "../../features/reflection/state/ReflectionContext";
import { callReflectApi } from "../../lib/reflectApi";

const steps = [
  { id: 0, label: "Intent", icon: Target },
  { id: 1, label: "Context", icon: Layers },
  { id: 2, label: "Options", icon: LayoutGrid },
  { id: 3, label: "Critique", icon: MessageSquare },
  { id: 4, label: "Improve", icon: Lightbulb },
  { id: 5, label: "Trace", icon: FileText },
];

export default function StepNavigator() {
  const { state, dispatch } = useReflection();

  async function handleStepClick(stepId: number) {
    // ⭐ Only Critique step requires waiting for AI
    if (stepId === 3) {
      try {
        dispatch({ type: "SET_LOADING", loading: true });

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
        };

        const result = await callReflectApi(payload);

        dispatch({
          type: "SET_REFLECTION_RESULT",
          payload: result,
        });

        // ⭐ Only navigate AFTER AI finishes
        dispatch({ type: "SET_STEP", step: 3 });
      } catch (err) {
        console.error("Reflection API error:", err);
      } finally {
        dispatch({ type: "SET_LOADING", loading: false });
      }

      return; // ⭐ Prevent default navigation
    }

    // Normal navigation for other steps
    dispatch({ type: "SET_STEP", step: stepId });
  }

  return (
    <div className="px-4 py-5 border-b border-border">
      <div className="flex items-center gap-1">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = state.currentStep === step.id;
          const isCompleted = state.currentStep > step.id;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => handleStepClick(step.id)}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 w-full group transition-all duration-200",
                  isActive && "scale-[1.02]"
                )}
              >
                <div
                  className={cn(
                    "relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                      : isCompleted
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <span
                  className={cn(
                    "text-[10px] font-medium leading-tight text-center transition-colors duration-200",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </button>

              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    "h-px flex-1 mx-1 mt-[-14px] transition-colors duration-300",
                    isCompleted ? "bg-primary/30" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {state.loading && (
        <div className="text-xs text-muted-foreground mt-2 px-1">
          Reflecting…
        </div>
      )}
    </div>
  );
}
