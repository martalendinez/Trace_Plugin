import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useReflection } from "../../features/reflection/state/ReflectionContext";
import type { ChatMessage, OptionCard } from "../../features/reflection/types";

const API = "http://localhost:3001";

export function RefineOptionStep() {
  const { state, dispatch } = useReflection();

  const baseOption = state.optionBeingRefined;
  const option: OptionCard | null =
    state.refinedOptionDraft || state.optionBeingRefined;

  const messages = state.refinementChat;

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!baseOption || !option) return null;

  const handleBack = () => {
    dispatch({ type: "CLOSE_REFINEMENT_PAGE" });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
    };

    dispatch({
      type: "ADD_REFINEMENT_MESSAGE",
      message: userMessage,
    });

    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API}/api/reflect/refine-option`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: state.goal,
          audience: state.audience,
          productContext: state.productContext,
          designStage: state.designStage,
          contextSelection: state.contextSelection,
          option,
          messages: [...messages, userMessage],

          // ⭐ NEW — send extracted Figma design context
          designContext: state.extractedContext?.designContext || null,
        }),
      });

      const data = await res.json();

      dispatch({
        type: "ADD_REFINEMENT_MESSAGE",
        message: {
          role: "assistant",
          content:
            data.assistantMessage ||
            "I’ve refined this option based on your input.",
        },
      });

      if (data.refinedOption) {
        dispatch({
          type: "SET_REFINED_OPTION_DRAFT",
          option: data.refinedOption,
        });
      }
    } catch (err) {
      dispatch({
        type: "ADD_REFINEMENT_MESSAGE",
        message: {
          role: "assistant",
          content: "Something went wrong. Try again.",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (state.refinedOptionDraft) {
      dispatch({
        type: "APPLY_REFINED_OPTION",
        option: state.refinedOptionDraft,
      });
    }
  };

  return (
    <div className="flex flex-col h-full p-5">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={handleBack}
          className="p-1 rounded-md hover:bg-muted/60 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>

        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Refining option
          </p>
          <p className="text-sm font-semibold text-foreground truncate max-w-[260px]">
            {option.title}
          </p>
        </div>
      </div>

      {/* OPTION SUMMARY */}
      <div className="mb-3 space-y-1">
        <p className="text-[11px] text-muted-foreground">{option.summary}</p>
        {option.problem && (
          <p className="text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">Problem: </span>
            {option.problem}
          </p>
        )}
      </div>

      {/* CHAT */}
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto panel-scroll mb-3">
        {messages.length === 0 && (
          <p className="text-[11px] text-muted-foreground">
            What would you like to improve or explore about this option?
          </p>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "self-end max-w-[80%] rounded-lg bg-primary text-primary-foreground px-3 py-2 text-[11px]"
                : "self-start max-w-[80%] rounded-lg bg-muted px-3 py-2 text-[11px] text-foreground"
            }
          >
            {m.content}
          </div>
        ))}

        {isLoading && (
          <p className="text-[11px] text-muted-foreground">Thinking…</p>
        )}
      </div>

      {/* INPUT + APPLY */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about this option…"
            className="flex-1 text-[11px] px-2 py-1.5 rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="text-[11px] font-medium px-2 py-1.5 rounded-md bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          >
            Send
          </button>
        </div>

        <button
          onClick={handleApply}
          disabled={!state.refinedOptionDraft}
          className="w-full text-[11px] font-medium px-2 py-1.5 rounded-md border border-primary text-primary hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Apply refinement to option
        </button>
      </div>
    </div>
  );
}
