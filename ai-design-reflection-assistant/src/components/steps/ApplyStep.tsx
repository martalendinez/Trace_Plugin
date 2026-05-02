import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Check, Plus, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";
import { useReflection } from "../../features/reflection/state/ReflectionContext";

const API = "http://localhost:3001";

export function ApplyStep() {
  const { state, dispatch } = useReflection();

  const [customText, setCustomText] = useState("");
  const [loading, setLoading] = useState(false);

  const improvements = state.improvements;

  const prevOptionId = useRef<string | null>(null);

  /* -------------------------------------------------------
     IMPROVEMENT GENERATION
  -------------------------------------------------------- */
  useEffect(() => {
    const generate = async () => {
      if (!state.selectedOptionId) return;

      const selectedOption = state.generatedOptions.find(
        (o) => o.id === state.selectedOptionId
      );

      if (!selectedOption) return;

      // reset if option changes
      if (prevOptionId.current !== state.selectedOptionId) {
        dispatch({
          type: "SET_IMPROVEMENTS",
          improvements: [],
        });
      }

      prevOptionId.current = state.selectedOptionId;

      setLoading(true);

      try {
        const res = await fetch(`${API}/api/reflect/improvements`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            goal: state.goal,
            audience: state.audience,
            productContext: state.productContext,
            designStage: state.designStage,
            contextSelection: state.contextSelection,
            selectedOption,
          }),
        });

        const data = await res.json();

        dispatch({
          type: "SET_IMPROVEMENTS",
          improvements: data.improvements || [],
        });
      } finally {
        setLoading(false);
      }
    };

    generate();
  }, [
    state.selectedOptionId,
    state.goal,
    state.audience,
    state.productContext,
    state.designStage,
    state.contextSelection,
    dispatch,
  ]);

  /* ------------------------------------------------------- */

  const addCustom = () => {
    if (!customText.trim()) return;

    dispatch({ type: "ADD_IMPROVEMENT", text: customText.trim() });
    setCustomText("");
  };

  const toggleApply = (id: string) => {
    dispatch({ type: "TOGGLE_IMPROVEMENT_APPLIED", id });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex-1 overflow-y-auto panel-scroll p-5 space-y-6"
    >
      {/* HEADER */}
      <div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.16em]">
          STEP 5 OF 6
        </p>
        <h3 className="text-sm font-semibold text-foreground">
          Improvements
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Apply or refine AI-generated suggestions.
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-xs text-muted-foreground">
          Generating improvements...
        </div>
      )}

      {/* IMPROVEMENTS */}
      <div className="space-y-2">
        {improvements.map((imp) => (
          <motion.div
            key={imp.id}
            layout
            className={cn(
              "flex items-start gap-2.5 p-3 rounded-xl border transition-all duration-200",
              imp.applied
                ? "bg-primary/5 border-primary/15"
                : "bg-card border-border hover:border-border/80"
            )}
          >
            <button
              onClick={() => toggleApply(imp.id)}
              className={cn(
                "w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5",
                imp.applied
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-border"
              )}
            >
              {imp.applied && <Check className="w-3 h-3" />}
            </button>

            <p
              className={cn(
                "text-xs leading-relaxed flex-1",
                imp.applied ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {imp.text}
            </p>
          </motion.div>
        ))}
      </div>

      {/* CUSTOM INPUT */}
      <div className="flex items-center gap-2">
        <input
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustom()}
          placeholder="Write your own improvement..."
          className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs outline-none"
        />
        <button
          onClick={addCustom}
          disabled={!customText.trim()}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            customText.trim()
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* APPLY BUTTON */}
      <button
        disabled={!improvements.some((i) => i.applied)}
        onClick={() => dispatch({ type: "NEXT_STEP" })}
        className={cn(
          "w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2",
          improvements.some((i) => i.applied)
            ? "bg-primary text-white"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Sparkles className="w-3.5 h-3.5" />
        Apply to Canvas
      </button>
    </motion.div>
  );
}
