import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, AlertTriangle, Info } from "lucide-react";
import { cn } from "../../lib/utils";
import { useReflection } from "../../features/reflection/state/ReflectionContext";
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
        <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", config.dot)} />

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
                <span className="font-medium text-foreground">Suggestion: </span>
                {critique.suggestion}
              </p>

              <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                {critique.uncertaintyNote}
              </p>

              <div className="flex flex-col gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onApply(critique);
                  }}
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Apply suggestion →
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDiscuss(critique);
                  }}
                  className="text-xs font-medium text-primary/70 hover:text-primary transition-colors"
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

export function CritiqueStep() {
  const { state, dispatch } = useReflection();

  useEffect(() => {
    dispatch({ type: "RUN_CRITIQUE" });
  }, [state.activeCritiqueCategories]);

  const handleApply = (critique: CritiqueItem) => {
    dispatch({ type: "ADD_IMPROVEMENT", text: critique.suggestion });
    dispatch({ type: "REMOVE_CRITIQUE", id: critique.id });
  };

  const handleDiscuss = (critique: CritiqueItem) => {
    dispatch({
      type: "SET_FIELD",
      field: "ownImprovement",
      value: critique.suggestion,
    });
    dispatch({ type: "NEXT_STEP" });
  };

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
          STEP 4 OF 6
        </p>

        <h3 className="text-sm font-semibold text-foreground">Critique mode</h3>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Review potential issues critically. Apply suggestions you want to keep.
        </p>
      </div>

      {/* CATEGORY CHECKBOXES */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-foreground">Consider before continuing</span>

        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <label
              key={cat.value}
              className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 text-xs cursor-pointer hover:bg-muted/40"
            >
              <input
                type="checkbox"
                checked={state.activeCritiqueCategories.includes(cat.value)}
                onChange={() =>
                  dispatch({ type: "TOGGLE_CRITIQUE_CATEGORY", value: cat.value })
                }
              />
              <span>{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* CRITIQUE LIST */}
      <AnimatePresence mode="popLayout">
        {state.critiques.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-dashed border-border rounded-lg p-4 bg-muted/20 text-center"
          >
            <p className="text-xs text-muted-foreground">
              No critique items available. Select categories or continue.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2.5">
            {state.critiques.map((critique) => (
              <CritiqueCard
                key={critique.id}
                critique={critique}
                onApply={handleApply}
                onDiscuss={handleDiscuss}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* ACTIONS */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => dispatch({ type: "PREV_STEP" })}
          className="flex-1 py-2.5 rounded-lg text-xs font-medium border border-border bg-card text-foreground hover:bg-muted/50 transition-all"
        >
          Back
        </button>

        <button
          onClick={() => dispatch({ type: "NEXT_STEP" })}
          className="flex-1 py-2.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/25 transition-all"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
}
