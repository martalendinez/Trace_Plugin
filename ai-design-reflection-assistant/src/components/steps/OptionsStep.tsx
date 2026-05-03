import { motion } from "framer-motion";
import { useReflection } from "../../features/reflection/state/ReflectionContext";
import type { OptionCard } from "../../features/reflection/types";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // ⭐ Lucide icons

const API = "http://localhost:3001";

export function OptionsStep() {
  const { state, dispatch } = useReflection();

  // Claude-style typing animation
  const [displayedReasoning, setDisplayedReasoning] = useState("");

  // Toggle to hide/show reasoning
  const [showReasoning, setShowReasoning] = useState(true);

  /* -------------------------------------------------------
     TYPING EFFECT — animates state.reasoning like Claude
  -------------------------------------------------------- */
  useEffect(() => {
    if (!state.reasoning) return;

    setDisplayedReasoning(""); // reset before typing

    let i = 0;
    const interval = setInterval(() => {
      setDisplayedReasoning(state.reasoning.slice(0, i));
      i++;

      if (i > state.reasoning.length) {
        clearInterval(interval);
      }
    }, 18); // typing speed (Claude-like)

    return () => clearInterval(interval);
  }, [state.reasoning]);

  /* -------------------------------------------------------
     GENERATE OPTIONS
  -------------------------------------------------------- */
  const handleGenerateOptions = async () => {
    dispatch({ type: "SET_LOADING", loading: true });

    try {
      const res = await fetch(`${API}/api/reflect/options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: state.goal,
          audience: state.audience,
          productContext: state.productContext,
          designStage: state.designStage,
          contextSelection: state.contextSelection,
          anythingElse: state.anythingElse,
        }),
      });

      const data = await res.json();

      dispatch({
        type: "SET_REFLECTION_RESULT",
        payload: {
          options: data.options,
          reasoning: data.reasoning,
          critiques: [],
          improvements: [],
          changeInstructions: [],
        },
      });

      // Always show reasoning again when generating new options
      setShowReasoning(true);

    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  };

  /* -------------------------------------------------------
     SELECT OPTION
  -------------------------------------------------------- */
  const handleSelect = (id: string) => {
    dispatch({ type: "SELECT_OPTION", value: id });
    dispatch({ type: "NEXT_STEP" });
  };

  /* -------------------------------------------------------
     REFINE OPTION
  -------------------------------------------------------- */
  const handleRefine = (option: OptionCard) => {
    dispatch({ type: "OPEN_REFINEMENT_PAGE", option });
  };

  return (
    <div className="p-6 space-y-6 h-full">
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          STEP 3 OF 6
        </p>

        <h3 className="text-sm font-semibold text-foreground">
          Explore options
        </h3>

        <p className="text-xs text-muted-foreground">
          Generate design options and select one to continue.
        </p>
      </div>

      <button
        onClick={handleGenerateOptions}
        className="text-[11px] px-3 py-2 rounded-md bg-primary text-primary-foreground"
      >
        Generate options
      </button>

      {/* -------------------------------------------------------
         REASONING WITH ICON TOGGLE
      -------------------------------------------------------- */}
      {displayedReasoning && (
        <div className="relative mt-2">
          {/* Toggle icon */}
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="absolute right-0 top-0 p-1 opacity-70 hover:opacity-100 transition"
          >
            {showReasoning ? (
              <Eye size={14} className="text-muted-foreground" />
            ) : (
              <EyeOff size={14} className="text-muted-foreground" />
            )}
          </button>

          {showReasoning && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] text-muted-foreground whitespace-pre-line leading-relaxed pr-6"
            >
              {displayedReasoning}
              <span className="animate-pulse">▍</span>
            </motion.div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------
         OPTIONS LIST
      -------------------------------------------------------- */}
      {state.generatedOptions.length === 0 ? (
        <p className="text-xs text-muted-foreground mt-4">
          No options yet.
        </p>
      ) : (
        <div className="space-y-4 mt-2">
          {state.generatedOptions.map((option) => (
            <motion.div
              key={option.id}
              layout
              className="border border-border rounded-lg p-4 space-y-4 bg-card"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-semibold text-foreground">
                    {option.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {option.summary}
                  </p>
                </div>

                <button
                  onClick={() => handleSelect(option.id)}
                  className="text-[11px] px-3 py-1.5 rounded-md bg-primary text-white"
                >
                  Select
                </button>
              </div>

              <button
                onClick={() => handleRefine(option)}
                className="text-[11px] text-primary"
              >
                Refine with AI →
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
