import { motion } from "framer-motion";
import { useReflection } from "../../features/reflection/state/ReflectionContext";
import type { OptionCard } from "../../features/reflection/types";

const API = "http://localhost:3001";

export function OptionsStep() {
  const { state, dispatch } = useReflection();

  const handleGenerateOptions = async () => {
    dispatch({ type: "SET_LOADING", loading: true });

    const res = await fetch(`${API}/api/reflect/options`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goal: state.goal,
        audience: state.audience,
        productContext: state.productContext,
        designStage: state.designStage,
        contextSelection: state.contextSelection,
      }),
    });

    const data = await res.json();

    dispatch({
      type: "SET_REFLECTION_RESULT",
      payload: {
        options: data.options,
        critiques: [],
        improvements: [],
        changeInstructions: [],
      },
    });

    dispatch({ type: "SET_LOADING", loading: false });
  };

  const handleSelect = (id: string) => {
    dispatch({ type: "SELECT_OPTION", value: id });
    dispatch({ type: "NEXT_STEP" });
  };

  const handleRefine = (option: OptionCard) => {
    dispatch({ type: "OPEN_REFINEMENT_PAGE", option });
  };

  return (
    <div className="p-6 space-y-6 h-full">
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          STEP 3 OF 7
        </p>

        <h3 className="text-sm font-semibold text-foreground">
          Explore options
        </h3>

        <p className="text-xs text-muted-foreground">
          Generate design options, refine them with AI, or select one to continue.
        </p>
      </div>

      <button
        onClick={handleGenerateOptions}
        className="text-[11px] px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Generate options
      </button>

      {state.generatedOptions.length === 0 ? (
        <p className="text-xs text-muted-foreground mt-4">
          No options yet. Click “Generate options” to begin.
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
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {option.summary}
                  </p>
                </div>

                <button
                  onClick={() => handleSelect(option.id)}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap"
                >
                  Select
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] text-muted-foreground flex-1 leading-relaxed">
                  {option.problem}
                </p>

                <button
                  onClick={() => handleRefine(option)}
                  className="text-[11px] font-medium text-primary hover:text-primary/80 whitespace-nowrap"
                >
                  Refine with AI →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
