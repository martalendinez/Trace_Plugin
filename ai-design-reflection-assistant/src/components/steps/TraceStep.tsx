import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Pencil,
  Target,
  MessageSquare,
  Lightbulb,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useReflection } from "../../features/reflection/state/ReflectionContext";

export function TraceStep() {
  const { state, dispatch } = useReflection();

  const [visible, setVisible] = useState(true);

  const appliedImprovements = state.improvements.filter((i) => i.applied);

  const entries = useMemo(
    () => [
      {
        id: 1,
        step: "Intent",
        icon: Target,
        color: "bg-primary/10 text-primary",
        content: state.goal || "No intent provided.",
        editable: true,
        goToStep: 0, // ⭐ go back to IntentStep
      },
      {
        id: 2,
        step: "Critique",
        icon: MessageSquare,
        color: "bg-amber-50 text-amber-600",
        content:
          state.critiques.length === 0
            ? "No critique items were reviewed."
            : `${state.critiques.length} issue(s) reviewed.`,
        editable: false,
      },
      {
        id: 3,
        step: "Improvements",
        icon: Lightbulb,
        color: "bg-emerald-50 text-emerald-600",
        content:
          appliedImprovements.length === 0
            ? "No improvements were applied."
            : `Applied ${appliedImprovements.length} improvement(s).`,
        editable: true,
        goToStep: 4, // ⭐ go back to ApplyStep
      },
    ],
    [state, appliedImprovements]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex-1 overflow-y-auto panel-scroll p-4 space-y-4"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Trace Log</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Full reflection trail
          </p>
        </div>

        <button
          onClick={() => setVisible(!visible)}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
        >
          {visible ? (
            <EyeOff className="w-3.5 h-3.5" />
          ) : (
            <Eye className="w-3.5 h-3.5" />
          )}
          {visible ? "Hide" : "Show"}
        </button>
      </div>

      {/* TIMELINE */}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-0"
          >
            {entries.map((entry, idx) => {
              const Icon = entry.icon;

              return (
                <div key={entry.id} className="relative flex gap-3">
                  {/* Timeline left column */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                        entry.color
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    {idx < entries.length - 1 && (
                      <div className="w-px flex-1 bg-border my-1" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-5 flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">
                        {entry.step}
                      </span>

                      {entry.editable && (
                        <button
                          onClick={() =>
                            dispatch({
                              type: "SET_STEP",
                              step: entry.goToStep,
                            })
                          }
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {entry.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-3 gap-2">
        <SummaryStat label="Intent" value={state.goal ? "Defined" : "None"} />
        <SummaryStat
          label="Issues"
          value={`${state.critiques.length} found`}
        />
        <SummaryStat
          label="Applied"
          value={`${appliedImprovements.length} applied`}
        />
      </div>

      {/* ACTIONS */}
      <div className="flex justify-between pt-2">
        <button
          onClick={() => dispatch({ type: "PREV_STEP" })}
          className="h-10 px-4 rounded-lg border border-border bg-card text-xs font-medium hover:bg-muted/50 transition-all"
        >
          Back
        </button>

        <button
          onClick={() => alert("Reflection complete ✨")}
          className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-medium shadow-sm shadow-primary/20 hover:shadow-md transition-all"
        >
          Finish
        </button>
      </div>
    </motion.div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/60 rounded-lg p-2.5 text-center">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="text-xs font-semibold text-foreground mt-0.5">{value}</p>
    </div>
  );
}
