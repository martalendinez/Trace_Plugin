import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, AlertTriangle, Info } from "lucide-react";
import { cn } from "../../lib/utils";
import { useReflection } from "../../features/reflection/state/ReflectionContext";
import { callReflectApi } from "../../lib/reflectApi";
import type { CritiqueItem, CritiqueCategory } from "../../features/reflection/types";

const severityConfig = {
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50",
    border: "border-amber-200/60",
    tag: "bg-amber-100 text-amber-700",
    dot: "bg-amber-400",
  },
  info: {
    icon: Info,
    bg: "bg-primary/[0.03]",
    border: "border-primary/10",
    tag: "bg-primary/10 text-primary",
    dot: "bg-primary",
  },
};

function CritiqueCard({
  critique,
  onApply,
  onDiscuss,
}: {
  critique: CritiqueItem;
  onApply: (c: CritiqueItem) => void;
  onDiscuss: (c: CritiqueItem) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const config =
    severityConfig[critique.category === "accessibility" ? "warning" : "info"];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className={cn(
        "border rounded-xl overflow-hidden transition-all duration-200",
        config.border,
        expanded ? config.bg : "bg-card hover:bg-muted/30"
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-3 text-left"
      >
        <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5", config.dot)} />

        <div className="flex-1 min-w-0">
          <span
            className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded-full uppercase tracking-wider",
              config.tag
            )}
          >
            {critique.category}
          </span>

          <p className="text-sm font-medium text-foreground mt-1">
            {critique.title}
          </p>
        </div>

        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pl-[26px] space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {critique.concern}
              </p>

              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">
                  Suggestion:{" "}
                </span>
                {critique.suggestion}
              </p>

              <p className="text-[11px] italic text-muted-foreground">
                {critique.uncertaintyNote}
              </p>

              {/* RESTORED ACTIONS */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onApply(critique);
                  }}
                  className="text-xs font-medium text-primary hover:text-primary/80"
                >
                  Apply suggestion
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDiscuss(critique);
                  }}
                  className="text-xs font-medium text-primary/70 hover:text-primary"
                >
                  Discuss with AI →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const CATEGORIES: { value: CritiqueCategory; label: string }[] = [
  { value: "accessibility", label: "Accessibility" },
  { value: "edge-cases", label: "Edge cases" },
  { value: "interaction-complexity", label: "Interaction complexity" },
  { value: "consistency", label: "Consistency" },
  { value: "usability", label: "Usability" },
];

const normalize = (str: string) =>
  str.replace(/_/g, "-").toLowerCase();

export function CritiqueStep() {
  const { state, dispatch } = useReflection();

  useEffect(() => {
    async function runCritique() {
      if (!state.selectedOptionId) return;

      dispatch({ type: "SET_LOADING", loading: true });

      const selectedOption = state.generatedOptions.find(
        (o) => o.id === state.selectedOptionId
      );

      const result = await callReflectApi({
        goal: state.goal,
        audience: state.audience,
        productContext: state.productContext,
        designStage: state.designStage,
        contextSelection: state.contextSelection,
        selectedOption,
        designContext: state.extractedContext?.designContext || null,
      });

      dispatch({
        type: "SET_REFLECTION_RESULT",
        payload: result,
      });

      dispatch({ type: "SET_LOADING", loading: false });
    }

    runCritique();
  }, [state.selectedOptionId]);

  const filteredCritiques =
    state.activeCritiqueCategories.length === 0
      ? state.critiques
      : state.critiques.filter((c) =>
          state.activeCritiqueCategories
            .map(normalize)
            .includes(normalize(c.category))
        );

  const handleApply = (critique: CritiqueItem) => {
    dispatch({ type: "ADD_IMPROVEMENT", text: critique.suggestion });
    dispatch({ type: "REMOVE_CRITIQUE", id: critique.id });
  };

  const handleDiscuss = (critique: CritiqueItem) => {
    dispatch({ type: "OPEN_CRITIQUE_CHAT", critique });
  };

  // 🔥 SAFE GENERATION (used by Skip + Continue)
  const ensureImprovements = async () => {
    const selectedOption = state.generatedOptions.find(
      (o) => o.id === state.selectedOptionId
    );

    if (state.improvements.length > 0) return;

    const result = await callReflectApi({
      goal: state.goal,
      audience: state.audience,
      productContext: state.productContext,
      designStage: state.designStage,
      contextSelection: state.contextSelection,
      selectedOption,
      designContext: state.extractedContext?.designContext || null,
      forceImprovements: true,
    });

    dispatch({
      type: "SET_REFLECTION_RESULT",
      payload: result,
    });
  };

  const handleBack = () => {
    dispatch({ type: "PREV_STEP" });
  };

  const handleSkip = async () => {
    await ensureImprovements();
    dispatch({ type: "NEXT_STEP" });
  };

  const handleContinue = async () => {
    await ensureImprovements();
    dispatch({ type: "NEXT_STEP" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 overflow-y-auto p-5 space-y-6"
    >
      {/* HEADER */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          STEP 4 OF 6
        </p>
        <h3 className="text-sm font-semibold">Critique mode</h3>
        <p className="text-xs text-muted-foreground">
          Review issues or skip if you're happy with the option.
        </p>
      </div>

      {/* FILTERS */}
      <div className="space-y-2">
        {CATEGORIES.map((cat) => (
          <label
            key={cat.value}
            className="flex items-center gap-2 text-xs border border-border rounded-lg px-3 py-2"
          >
            <input
              type="checkbox"
              checked={state.activeCritiqueCategories.includes(cat.value)}
              onChange={() =>
                dispatch({
                  type: "TOGGLE_CRITIQUE_CATEGORY",
                  value: cat.value,
                })
              }
            />
            {cat.label}
          </label>
        ))}
      </div>

      {/* CRITIQUES */}
      <div className="space-y-2">
        {filteredCritiques.length === 0 ? (
          <div className="border border-dashed rounded-lg p-4 text-xs text-muted-foreground">
            No critiques — you can skip or continue.
          </div>
        ) : (
          filteredCritiques.map((c) => (
            <CritiqueCard
              key={c.id}
              critique={c}
              onApply={handleApply}
              onDiscuss={handleDiscuss}
            />
          ))
        )}
      </div>

      {/* BUTTONS */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={handleBack}
          className="flex-1 py-2 rounded-lg border border-border text-xs"
        >
          Back
        </button>

        <button
          onClick={handleSkip}
          className="flex-1 py-2 rounded-lg bg-muted text-xs"
        >
          Skip
        </button>

        <button
          onClick={handleContinue}
          className="flex-1 py-2 rounded-lg bg-primary text-white text-xs"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
}