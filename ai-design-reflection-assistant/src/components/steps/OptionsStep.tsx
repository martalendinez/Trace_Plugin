import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { cn } from "../../lib/utils";
import { useReflection } from "../../features/reflection/state/ReflectionContext";
import { generateOptions } from "../../lib/generateOptions";

export function OptionsStep() {
  const { state, dispatch } = useReflection();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedOption = useMemo(
    () =>
      state.generatedOptions.find((o) => o.id === state.selectedOptionId) ??
      null,
    [state.generatedOptions, state.selectedOptionId]
  );

  const handleShuffle = async () => {
    try {
      setIsGenerating(true);

      const payload = {
        goal: state.goal,
        audience: state.audience,
        productContext: state.productContext,
        designStage: state.designStage,
        contextSelection: state.contextSelection,
      };

      const result = await generateOptions(payload);

      dispatch({
        type: "SET_FIELD",
        field: "generatedOptions",
        value: result.options,
      });
    } catch (err) {
      console.error("Shuffle error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleReasoning = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
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
          STEP 3 OF 6
        </p>

        <h3 className="text-sm font-semibold text-foreground">Options</h3>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Click Shuffle to generate new AI options.
        </p>
      </div>

      {/* EMPTY STATE */}
      {state.generatedOptions.length === 0 && (
        <div className="border border-dashed border-border rounded-lg p-4 bg-muted/20 text-center">
          <p className="text-xs text-muted-foreground">
            No options yet. Click Shuffle to generate AI options.
          </p>
        </div>
      )}

      {/* OPTION CARDS */}
      {state.generatedOptions.length > 0 && (
        <div className="space-y-2.5">
          {state.generatedOptions.map((option) => {
            const isSelected = state.selectedOptionId === option.id;
            const isOpen = expandedId === option.id;

            return (
              <div
                key={option.id}
                className={cn(
                  "rounded-xl border p-3.5 transition-all duration-200 space-y-2.5",
                  isSelected
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-card hover:bg-muted/30"
                )}
              >
                {/* Title + Summary */}
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">
                    {option.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {option.summary}
                  </p>
                </div>

                {/* Reasoning */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pt-1 pb-0.5">
                        <div className="text-[11px] text-muted-foreground leading-relaxed border-t border-border/60 pt-2.5 space-y-1.5">
                          <p>
                            <span className="font-medium text-foreground">
                              Problem:
                            </span>{" "}
                            {option.problem}
                          </p>
                          <p>
                            <span className="font-medium text-foreground">
                              Assumption:
                            </span>{" "}
                            {option.assumption}
                          </p>
                          <p>
                            <span className="font-medium text-foreground">
                              Design principle:
                            </span>{" "}
                            {option.principle}
                          </p>
                          <p>
                            <span className="font-medium text-foreground">
                              Trade-off:
                            </span>{" "}
                            {option.tradeoff}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Buttons */}
                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    onClick={() =>
                      dispatch({
                        type: "SELECT_OPTION",
                        value: option.id,
                      })
                    }
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "bg-muted text-foreground hover:bg-muted/70"
                    )}
                  >
                    {isSelected ? "Selected" : "Select"}
                  </button>

                  <button
                    onClick={() => toggleReasoning(option.id)}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                  >
                    {isOpen ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                    View reasoning
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SELECTED NOTE */}
      <p className="text-[11px] text-muted-foreground min-h-[16px]">
        {selectedOption ? (
          <>
            Currently selected:{" "}
            <span className="font-medium text-foreground">
              {selectedOption.title}
            </span>
          </>
        ) : (
          "No option selected yet."
        )}
      </p>

      {/* ACTIONS */}
      <div className="flex gap-2">
        <button
          onClick={() => dispatch({ type: "PREV_STEP" })}
          className="flex-1 py-2.5 rounded-lg text-xs font-medium border border-border bg-card text-foreground hover:bg-muted/50 transition-all"
        >
          Back
        </button>

        <button
          onClick={handleShuffle}
          disabled={isGenerating}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium border border-border bg-card text-foreground hover:bg-muted/50 transition-all disabled:opacity-50"
        >
          <RefreshCw
            className={cn("w-3.5 h-3.5", isGenerating && "animate-spin")}
          />
          Shuffle
        </button>

        <button
          onClick={() => dispatch({ type: "NEXT_STEP" })}
          className={cn(
            "flex-1 py-2.5 rounded-lg text-xs font-medium transition-all",
            "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/25"
          )}
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
}
