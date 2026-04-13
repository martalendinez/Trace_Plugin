import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";
import { useReflection } from "../../features/reflection/state/ReflectionContext";
import type { ContextItem, DesignStage } from "../../features/reflection/types";

const DESIGN_STAGES: { value: DesignStage; label: string }[] = [
  { value: "research", label: "Research" },
  { value: "wireframe", label: "Wireframe" },
  { value: "early-concept", label: "Early concept" },
  { value: "high-fidelity", label: "High fidelity" },
];

const CONTEXT_OPTIONS: { value: ContextItem; label: string }[] = [
  { value: "selected-ui", label: "Selected frame" },
  { value: "text-content", label: "Text content" },
  { value: "component-structure", label: "Component structure" },
  { value: "style-tokens", label: "Color & style tokens" },
  { value: "accessibility", label: "Accessibility checks" },
  { value: "interactions", label: "Prototype interactions" },
  { value: "images-icons", label: "Images & icons" },
];

const Field = ({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-foreground block">{label}</label>
    {children}
    {helper && (
      <p className="text-[11px] text-muted-foreground">{helper}</p>
    )}
  </div>
);

const CheckboxChip = ({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) => (
  <button
    onClick={onToggle}
    className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all duration-150 text-left w-full",
      checked
        ? "border-primary/40 bg-primary/5 text-primary"
        : "border-border bg-card text-foreground hover:bg-muted/40"
    )}
  >
    <div
      className={cn(
        "w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors",
        checked ? "bg-primary border-primary" : "border-border"
      )}
    >
      {checked && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
    </div>

    <span className="flex-1">{label}</span>
  </button>
);

export function ContextStep() {
  const { state, dispatch } = useReflection();

  const toggleStage = (value: DesignStage) => {
    dispatch({ type: "TOGGLE_STAGE", value });
  };

  const toggleContext = (value: ContextItem) => {
    dispatch({ type: "TOGGLE_CONTEXT", value });
  };

  const canContinue =
    Boolean(state.selectedElement) ||
    Boolean(state.productContext) ||
    state.designStage.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex-1 overflow-y-auto panel-scroll p-5 space-y-6"
    >
      {/* HEADER */}
      <div className="space-y-1">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.16em]">
          STEP 2 OF 6
        </p>

        <h3 className="text-sm font-semibold text-foreground">
          Provide design context
        </h3>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Help the AI understand your design so it can give more relevant and accurate feedback.
        </p>
      </div>

      {/* SELECTED ELEMENT */}
      <Field label="What part of the design are you working on?">
        <input
          value={state.selectedElement}
          onChange={(e) =>
            dispatch({
              type: "SET_FIELD",
              field: "selectedElement",
              value: e.target.value,
            })
          }
          placeholder="Onboarding screen – Figma Frame"
          className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-xs outline-none placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
        />
      </Field>

      {/* PRODUCT CONTEXT */}
      <Field label="What is this product or feature?">
        <input
          value={state.productContext}
          onChange={(e) =>
            dispatch({
              type: "SET_FIELD",
              field: "productContext",
              value: e.target.value,
            })
          }
          placeholder="Fitness tracking app"
          className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-xs outline-none placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
        />
      </Field>

      {/* DESIGN STAGE */}
      <Field
        label="What stage are you in?"
        helper="Select the stage that best matches your current work."
      >
        <div className="grid grid-cols-2 gap-2">
          {DESIGN_STAGES.map((stage) => (
            <CheckboxChip
              key={stage.value}
              label={stage.label}
              checked={state.designStage.includes(stage.value)}
              onToggle={() => toggleStage(stage.value)}
            />
          ))}
        </div>
      </Field>

      {/* CONTEXT OPTIONS */}
      <Field
        label="What information should the AI use?"
        helper="Choose what the AI can extract from your selected frame."
      >
        <div className="space-y-1.5">
          {CONTEXT_OPTIONS.map((item) => (
            <CheckboxChip
              key={item.value}
              label={item.label}
              checked={state.contextSelection.includes(item.value)}
              onToggle={() => toggleContext(item.value)}
            />
          ))}
        </div>
      </Field>

      {/* EXTRA NOTES */}
      <Field label="Anything else the AI should know?">
        <textarea
          value={state.designerNotes}
          onChange={(e) =>
            dispatch({
              type: "SET_FIELD",
              field: "designerNotes",
              value: e.target.value,
            })
          }
          placeholder="This screen appears after account creation."
          rows={3}
          className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-xs outline-none resize-none placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
        />
      </Field>

      {/* DEBUG VIEWER */}
      {state.extractedContext && (
        <div className="mt-4 p-3 bg-muted rounded-lg border border-border">
          <p className="text-[10px] font-medium text-muted-foreground mb-1">
            Extracted Context (debug)
          </p>
          <pre className="text-[10px] whitespace-pre-wrap text-muted-foreground max-h-48 overflow-auto">
            {JSON.stringify(state.extractedContext, null, 2)}
          </pre>
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => dispatch({ type: "SET_STEP", step: 0 })}
          className="flex-1 py-2.5 rounded-lg text-xs font-medium border border-border bg-card text-foreground hover:bg-muted/50 transition-all"
        >
          Back
        </button>

        <button
          disabled={!canContinue}
          onClick={() => {
            parent.postMessage(
              {
                pluginMessage: {
                  type: "REQUEST_CONTEXT",
                  selectionId: state.selectedElementId,
                  contextSelection: state.contextSelection,
                },
              },
              "*"
            );

            dispatch({ type: "NEXT_STEP" });
          }}
          className={cn(
            "flex-1 py-2.5 rounded-lg text-xs font-medium transition-all",
            canContinue
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/25"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
}
