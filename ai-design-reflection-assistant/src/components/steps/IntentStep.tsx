import { motion } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "../../lib/utils";
import { useReflection } from "../../features/reflection/state/ReflectionContext";
import type { ReflectionState, TaskMode } from "../../features/reflection/types";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../components/ui/dropdown-menu";

interface FieldProps {
  label: string;
  helper: string;
  children: React.ReactNode;
}

/* -----------------------------
   TASK MODES (MATCHES types.ts)
----------------------------- */

const TASK_MODES: { value: TaskMode; label: string }[] = [
  { value: "design", label: "Design exploration" },
  { value: "evaluation", label: "Evaluate design" },
  { value: "research", label: "User research" },
  { value: "content", label: "Content / UX writing" },
  { value: "strategy", label: "Product strategy" },
];

const Field = ({ label, helper, children }: FieldProps) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-foreground">
      {label}
    </label>

    {children}

    <p className="text-[11px] text-muted-foreground">{helper}</p>
  </div>
);

export function IntentStep() {
  const { state, dispatch } = useReflection();

  const selected = TASK_MODES.find((t) => t.value === state.taskMode);

  const update = <K extends keyof ReflectionState>(
    field: K,
    value: ReflectionState[K]
  ) => {
    dispatch({ type: "SET_FIELD", field, value });
  };

  const canContinue =
    Boolean(state.taskMode) &&
    Boolean(state.goal.trim()) &&
    Boolean(state.audience.trim());

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
          STEP 1 OF 6
        </p>

        <h3 className="text-sm font-semibold text-foreground">
          Explain your design intent
        </h3>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Describe what you're trying to achieve so the AI can give relevant feedback.
        </p>
      </div>

      {/* TASK TYPE */}
      <Field
        label="Task type"
        helper="Select the type of support you need."
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs bg-card",
                "border-border hover:border-border/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              )}
            >
              <span className={selected ? "text-foreground" : "text-muted-foreground"}>
                {selected ? selected.label : "Select task type..."}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-lg border border-border bg-card p-1 shadow-lg">
            {TASK_MODES.map((t) => (
              <DropdownMenuItem
                key={t.value}
                onClick={() => update("taskMode", t.value)}
                className={cn(
                  "flex items-center justify-between px-2.5 py-2 text-xs rounded-md hover:bg-muted/70 cursor-pointer",
                  state.taskMode === t.value && "bg-primary/5 text-primary"
                )}
              >
                <span>{t.label}</span>
                {state.taskMode === t.value && (
                  <Check className="w-3.5 h-3.5" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </Field>

      {/* GOAL */}
      <Field
        label="What is your goal?"
        helper="What should users achieve?"
      >
        <input
          value={state.goal}
          onChange={(e) => update("goal", e.target.value)}
          placeholder="e.g. Help users complete onboarding faster"
          className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-xs outline-none placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
        />
      </Field>

      {/* AUDIENCE */}
      <Field
        label="Who is this for?"
        helper="Describe your target users."
      >
        <input
          value={state.audience}
          onChange={(e) => update("audience", e.target.value)}
          placeholder="e.g. First-time users, non-technical"
          className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-xs outline-none placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
        />
      </Field>

      {/* CONTINUE */}
      <button
        disabled={!canContinue}
        onClick={() => dispatch({ type: "NEXT_STEP" })}
        className={cn(
          "w-full py-2.5 rounded-lg text-xs font-medium transition-all",
          canContinue
            ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/25"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        )}
      >
        Continue
      </button>
    </motion.div>
  );
}