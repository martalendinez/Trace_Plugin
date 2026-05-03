import { motion } from "framer-motion";
import { useReflection } from "../../features/reflection/state/ReflectionContext";
import type { OptionCard } from "../../features/reflection/types";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  DndContext,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";

import type { DragEndEvent } from "@dnd-kit/core";

const API = "http://localhost:3001";

type MixKey = "title" | "summary" | "principle" | "tradeoff";

type MixFieldState = {
  [K in MixKey]?: {
    label: string;
    value: string;
  };
};

type DraggableFieldProps = {
  optionId: string;
  fieldKey: MixKey;
  label: string;
  value: string;
};

function DraggableField({ optionId, fieldKey, label, value }: DraggableFieldProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `${optionId}-${fieldKey}`,
      data: {
        field: fieldKey,
        fieldLabel: label,
        value,
      },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-start gap-2 text-[11px] text-muted-foreground cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-60" : ""
      }`}
      {...listeners}
      {...attributes}
    >
      <span className="mt-[2px] text-[10px] text-muted-foreground/70">⋮⋮</span>
      <div>
        <span className="font-medium text-foreground text-[11px] mr-1">
          {label}:
        </span>
        <span>{value}</span>
      </div>
    </div>
  );
}

function MixBuilder({
  mixFields,
  onCreate,
}: {
  mixFields: MixFieldState;
  onCreate: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: "mix-builder",
  });

  const hasAnyField = Object.keys(mixFields).length > 0;

  return (
    <div className="mt-6 border border-dashed border-border rounded-lg p-4 space-y-3 bg-muted/40">
      <p className="text-[11px] font-medium text-foreground flex items-center justify-between">
        Mix & match
        <span className="text-[10px] text-muted-foreground">
          Drag fields into this builder
        </span>
      </p>

      <div
        ref={setNodeRef}
        className={`rounded-md p-3 min-h-[80px] text-[11px] space-y-2 ${
          isOver ? "bg-accent/40 border border-accent" : "bg-background"
        }`}
      >
        {(["title", "summary", "principle", "tradeoff"] as MixKey[]).map(
          (key) => (
            <div key={key} className="flex gap-2 items-start">
              <span className="w-20 text-muted-foreground capitalize">
                {key}
              </span>
              <span className="text-foreground">
                {mixFields[key]?.value || (
                  <span className="text-muted-foreground/70">
                    Drop {key} here…
                  </span>
                )}
              </span>
            </div>
          )
        )}
      </div>

      <button
        onClick={onCreate}
        disabled={!hasAnyField}
        className="text-[11px] px-3 py-1.5 rounded-md border border-border text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Create custom option
      </button>
    </div>
  );
}

export function OptionsStep() {
  const { state, dispatch } = useReflection();

  const [displayedReasoning, setDisplayedReasoning] = useState("");
  const [showReasoning, setShowReasoning] = useState(true);

  const [mixFields, setMixFields] = useState<MixFieldState>({});

  useEffect(() => {
    if (!state.reasoning) return;

    setDisplayedReasoning("");

    let i = 0;
    const interval = setInterval(() => {
      setDisplayedReasoning(state.reasoning.slice(0, i));
      i++;

      if (i > state.reasoning.length) {
        clearInterval(interval);
      }
    }, 18);

    return () => clearInterval(interval);
  }, [state.reasoning]);

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

      setShowReasoning(true);
      setMixFields({});
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  };

  const handleSelect = (id: string) => {
    dispatch({ type: "SELECT_OPTION", value: id });
    dispatch({ type: "NEXT_STEP" });
  };

  const handleRefine = (option: OptionCard) => {
    dispatch({ type: "OPEN_REFINEMENT_PAGE", option });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || over.id !== "mix-builder") return;

    const data = active.data.current as
      | { field: MixKey; fieldLabel: string; value: string }
      | undefined;

    if (!data) return;

    setMixFields((prev) => ({
      ...prev,
      [data.field]: {
        label: data.fieldLabel,
        value: data.value,
      },
    }));
  };

  const handleCreateCustomOption = () => {
    if (Object.keys(mixFields).length === 0) return;

    const customOption: OptionCard = {
      id: `custom-${Date.now()}`,
      title: mixFields.title?.value || "Custom option",
      summary: mixFields.summary?.value || "",
      problem: "",
      assumption: "",
      principle: mixFields.principle?.value || "",
      tradeoff: mixFields.tradeoff?.value || "",
      suggestedChanges: [],
    };

    const newOptions = [...state.generatedOptions, customOption];

    dispatch({
      type: "SET_REFLECTION_RESULT",
      payload: {
        options: newOptions,
        reasoning: state.reasoning,
        critiques: [],
        improvements: [],
        changeInstructions: [],
      },
    });

    setMixFields({});
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
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

        {displayedReasoning && (
          <div className="relative mt-2">
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

        {state.generatedOptions.length === 0 ? (
          <p className="text-xs text-muted-foreground mt-4">
            No options yet.
          </p>
        ) : (
          <>
            <div className="space-y-4 mt-2">
              {state.generatedOptions.map((option) => (
                <motion.div
                  key={option.id}
                  layout
                  className="border border-border rounded-lg p-4 space-y-4 bg-card"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <DraggableField
                        optionId={option.id}
                        fieldKey="title"
                        label="Title"
                        value={option.title}
                      />
                      <DraggableField
                        optionId={option.id}
                        fieldKey="summary"
                        label="Summary"
                        value={option.summary}
                      />
                      {option.principle && (
                        <DraggableField
                          optionId={option.id}
                          fieldKey="principle"
                          label="Principle"
                          value={option.principle}
                        />
                      )}
                      {option.tradeoff && (
                        <DraggableField
                          optionId={option.id}
                          fieldKey="tradeoff"
                          label="Tradeoff"
                          value={option.tradeoff}
                        />
                      )}
                    </div>

                    <button
                      onClick={() => handleSelect(option.id)}
                      className="text-[11px] px-3 py-1.5 rounded-md bg-primary text-white h-fit"
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

            <MixBuilder
              mixFields={mixFields}
              onCreate={handleCreateCustomOption}
            />
          </>
        )}
      </div>
    </DndContext>
  );
}
