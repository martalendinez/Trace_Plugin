import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";
import { useReflection } from "../../features/reflection/state/ReflectionContext";
import type { CritiqueItem } from "../../features/reflection/types";

const severityConfig: Record<
  string,
  { border: string; bg: string; dot: string; tag: string }
> = {
  accessibility: {
    border: "border-red-300",
    bg: "bg-red-50",
    dot: "bg-red-500",
    tag: "bg-red-100 text-red-700",
  },
  usability: {
    border: "border-amber-300",
    bg: "bg-amber-50",
    dot: "bg-amber-500",
    tag: "bg-amber-100 text-amber-700",
  },
  consistency: {
    border: "border-blue-300",
    bg: "bg-blue-50",
    dot: "bg-blue-500",
    tag: "bg-blue-100 text-blue-700",
  },
  "edge-cases": {
    border: "border-purple-300",
    bg: "bg-purple-50",
    dot: "bg-purple-500",
    tag: "bg-purple-100 text-purple-700",
  },
  "interaction-complexity": {
    border: "border-green-300",
    bg: "bg-green-50",
    dot: "bg-green-500",
    tag: "bg-green-100 text-green-700",
  },
};

function CritiqueCard({
  critique,
  onAccept,
  onReject,
  onDiscuss,
}: {
  critique: CritiqueItem;
  onAccept: (c: CritiqueItem) => void;
  onReject: (c: CritiqueItem) => void;
  onDiscuss: (c: CritiqueItem) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const config =
    severityConfig[critique.category] || severityConfig.usability;

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

      {expanded && (
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

          <div className="flex flex-col gap-1.5 pt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAccept(critique);
              }}
              className="text-xs font-medium text-primary hover:text-primary/80"
            >
              Accept
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onReject(critique);
              }}
              className="text-xs font-medium text-red-500 hover:text-red-600"
            >
              Reject
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDiscuss(critique);
              }}
              className="text-xs font-medium text-primary/70 hover:text-primary"
            >
              Discuss with AI
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function CritiqueStep() {
  const { state, dispatch } = useReflection();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCritiques = async () => {
      if (state.critiques.length > 0) return;

      setLoading(true);

      try {
        const selectedOption = state.generatedOptions.find(
          (o) => o.id === state.selectedOptionId
        );

        const res = await fetch("/api/reflect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            goal: state.goal,
            audience: state.audience,
            productContext: state.productContext,
            designStage: state.designStage,
            contextSelection: state.contextSelection,
            selectedOption,
            activeCritiqueCategories: state.activeCritiqueCategories,
          }),
        });

        const data = await res.json();

        dispatch({
          type: "SET_REFLECTION_RESULT",
          payload: data,
        });
      } catch (err) {
        console.error("Failed to load critiques", err);
      }

      setLoading(false);
    };

    loadCritiques();
  }, []);

  const handleAccept = (critique: CritiqueItem) => {
    dispatch({
      type: "ADD_IMPROVEMENT",
      text: critique.suggestion,
    });

    dispatch({
      type: "REMOVE_CRITIQUE",
      id: critique.id,
    });
  };

  const handleReject = (critique: CritiqueItem) => {
    dispatch({ type: "REMOVE_CRITIQUE", id: critique.id });
  };

  const handleDiscuss = (critique: CritiqueItem) => {
    dispatch({ type: "OPEN_CRITIQUE_CHAT", critique });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex-1 overflow-y-auto panel-scroll p-4 space-y-4"
    >
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">
          Critiques
        </h3>

        <p className="text-xs text-muted-foreground leading-relaxed">
          These critiques are generated from the option you selected.
          They highlight potential issues, risks, or blind spots you may not have considered yet.
          Accept critiques to include them in your final improvements, reject the ones you don’t want,
          or discuss any critique further with the AI.
        </p>
      </div>

      {loading && (
        <p className="text-xs text-muted-foreground">Loading critiques…</p>
      )}

      <AnimatePresence>
        {!loading &&
          state.critiques.map((critique) => (
            <CritiqueCard
              key={critique.id}
              critique={critique}
              onAccept={handleAccept}
              onReject={handleReject}
              onDiscuss={handleDiscuss}
            />
          ))}
      </AnimatePresence>

      <div className="flex justify-between pt-2">
        <button
          onClick={() => dispatch({ type: "PREV_STEP" })}
          className="h-10 px-4 rounded-lg border border-border bg-card text-xs font-medium hover:bg-muted/50 transition-all"
        >
          Back
        </button>

        <button
          onClick={() => dispatch({ type: "NEXT_STEP" })}
          className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-medium shadow-sm shadow-primary/20 hover:shadow-md transition-all"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
}
