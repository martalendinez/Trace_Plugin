import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, AlertTriangle, Info } from "lucide-react";
import { cn } from "../../lib/utils";
import { useReflection } from "../../features/reflection/state/ReflectionContext";
import { callReflectApi } from "../../lib/reflectApi";
import type {
  CritiqueItem,
  CritiqueCategory,
} from "../../features/reflection/types";

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
    severityConfig[
      critique.category === "accessibility" ? "warning" : "info"
    ];

  return (
    <motion.div
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
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
            config.dot
          )}
        />

        <div className="flex-1 min-w-0">
          <span
            className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded-full uppercase tracking-wider",
              config.tag
            )}
          >
            {critique.category}
          </span>

          <p className="text-sm font-medium text-foreground leading-snug mt-1">
            {critique.title}
          </p>
        </div>

        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 mt-1",
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
            transition={{ duration: 0.2 }}
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

              <p className="text-[11px] text-muted-foreground italic">
                {critique.uncertaintyNote}
              </p>

              <div className="flex flex-col gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onApply(critique);
                  }}
                  className="text-xs font-medium text-primary hover:text-primary/80"
                >
                  Apply suggestion →
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

const normalize = (str: string): CritiqueCategory =>
  str.replace(/_/g, "-").toLowerCase() as CritiqueCategory;

export function CritiqueStep() {
  const { state, dispatch } = useReflection();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function run() {
      if (!state.selectedOptionId) return;

      const selectedOption = state.generatedOptions.find(
        (o) => o.id === state.selectedOptionId
      );

      if (!selectedOption) return;

      setLoading(true);

      try {
        const result = await callReflectApi({
          goal: state.goal,
          audience: state.audience,
          productContext: state.productContext,
          designStage: state.designStage,
          contextSelection: state.contextSelection,
          selectedOption,
        });

        const normalizedCritiques: CritiqueItem[] = (
          result.critiques || []
        ).map((c: CritiqueItem) => ({
          ...c,
          category: normalize(c.category),
        }));

        dispatch({
          type: "SET_REFLECTION_RESULT",
          payload: {
            ...result,
            critiques: normalizedCritiques,
          },
        });

        if (!result.improvements?.length) {
          dispatch({
            type: "SET_IMPROVEMENTS",
            improvements: normalizedCritiques.map((c) => ({
              id: crypto.randomUUID(),
              text: c.suggestion,
              applied: false,
            })),
          });
        }
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [state.selectedOptionId]);

  const filteredCritiques =
    state.activeCritiqueCategories.length === 0
      ? state.critiques
      : state.critiques.filter((c: CritiqueItem) =>
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

  const handleSkip = () => {
    dispatch({ type: "SET_LOADING", loading: false });
    dispatch({ type: "NEXT_STEP" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 overflow-y-auto panel-scroll p-5 space-y-6"
    >
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          STEP 4 OF 7
        </p>

        <h3 className="text-sm font-semibold">Critique mode</h3>

        <p className="text-xs text-muted-foreground">
          Review issues or skip if you want to continue directly.
        </p>

        <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10 text-[11px] leading-relaxed space-y-1.5">
          <p className="text-[11px] text-foreground font-medium">
            What is Critique Mode?
          </p>

          <p className="text-[11px] text-muted-foreground">
            Critique Mode highlights potential issues in the option you selected.
            These aren’t errors — they’re prompts to help you think about things
            you might not have considered yet.
          </p>

          <p className="text-[11px] text-muted-foreground">
            Critiques are grouped into categories like{" "}
            <span className="font-medium text-foreground">accessibility</span>,{" "}
            <span className="font-medium text-foreground">usability</span>,{" "}
            <span className="font-medium text-foreground">consistency</span>, and{" "}
            <span className="font-medium text-foreground">edge cases</span>.
          </p>

          <p className="text-[11px] text-muted-foreground">
            You stay fully in control: apply a suggestion, ignore it, or discuss
            it with the AI.
          </p>
        </div>
      </div>

      {loading && (
        <div className="text-xs text-muted-foreground">
          Generating critique...
        </div>
      )}

      <div className="space-y-2">
        {CATEGORIES.map((cat) => (
          <label
            key={cat.value}
            className="flex items-center justify-between border border-border rounded-lg px-3 py-2 text-xs"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  dispatch({
                    type: "TOGGLE_CRITIQUE_CATEGORY",
                    value: cat.value,
                  })
                }
                className={cn(
                  "w-4 h-4 rounded-md border transition-all flex items-center justify-center",
                  state.activeCritiqueCategories.includes(cat.value)
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-card border-border hover:bg-muted/40"
                )}
              >
                {state.activeCritiqueCategories.includes(cat.value) && (
                  <div className="w-2 h-2 rounded-sm bg-primary-foreground" />
                )}
              </button>

              <span>{cat.label}</span>
            </div>
          </label>
        ))}
      </div>

      <div className="space-y-2">
        {filteredCritiques.map((critique: CritiqueItem) => (
          <CritiqueCard
            key={critique.id}
            critique={critique}
            onApply={handleApply}
            onDiscuss={handleDiscuss}
          />
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={() => dispatch({ type: "PREV_STEP" })}
          className="flex-1 py-2.5 rounded-lg border text-xs"
        >
          Back
        </button>

        <button
          onClick={handleSkip}
          className="flex-1 py-2.5 rounded-lg text-xs bg-muted"
        >
          Skip
        </button>

        <button
          onClick={() => dispatch({ type: "NEXT_STEP" })}
          className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
}
