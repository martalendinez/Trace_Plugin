import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useReflection } from "../../features/reflection/state/ReflectionContext";
import type { ChatMessage, CritiqueItem } from "../../features/reflection/types";

const API = "http://localhost:3001";

export function CritiqueChatStep() {
  const { state, dispatch } = useReflection();

  const critique = state.critiqueBeingDiscussed;
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!critique) return null;

  const handleBack = () => {
    dispatch({ type: "CLOSE_CRITIQUE_CHAT" });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
    };

    dispatch({
      type: "ADD_CRITIQUE_CHAT_MESSAGE",
      message: userMessage,
    });

    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API}/api/reflect/discuss-critique`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          critique,
          messages: [...state.critiqueChat, userMessage],
          goal: state.goal,
          audience: state.audience,
          productContext: state.productContext,
          designStage: state.designStage,
          contextSelection: state.contextSelection,
        }),
      });

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.assistantMessage || "",
      };

      dispatch({
        type: "ADD_CRITIQUE_CHAT_MESSAGE",
        message: assistantMessage,
      });

      if (data.refinedSuggestion) {
        dispatch({
          type: "SET_REFINED_CRITIQUE_SUGGESTION",
          value: data.refinedSuggestion,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (state.refinedCritiqueSuggestion) {
      dispatch({
        type: "ADD_IMPROVEMENT",
        text: state.refinedCritiqueSuggestion,
      });
      dispatch({ type: "CLOSE_CRITIQUE_CHAT" });
    }
  };

  return (
    <div className="flex flex-col h-full p-6 gap-6">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="p-1 rounded-md hover:bg-muted/60 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="space-y-0.5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Discussing critique
          </p>
          <p className="text-sm font-semibold text-foreground truncate max-w-[260px]">
            {critique.title}
          </p>
        </div>
      </div>

      {/* CRITIQUE CARD */}
      <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-3">
        <span className="text-[10px] font-medium uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          {critique.category}
        </span>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {critique.concern}
        </p>

        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground">Suggestion: </span>
          {critique.suggestion}
        </p>

        <p className="text-[11px] text-muted-foreground italic leading-relaxed">
          {critique.uncertaintyNote}
        </p>
      </div>

      {/* CHAT */}
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto panel-scroll">
        {state.critiqueChat.length === 0 && (
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Ask the AI to explore this critique, propose alternatives, or
            justify the reasoning behind it.
          </p>
        )}

        {state.critiqueChat.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "self-end max-w-[80%] rounded-lg bg-primary text-primary-foreground px-3 py-2 text-[11px] leading-relaxed"
                : "self-start max-w-[80%] rounded-lg bg-muted px-3 py-2 text-[11px] text-foreground leading-relaxed"
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
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about this critique…"
            className="flex-1 text-[11px] px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="text-[11px] font-medium px-3 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          >
            Send
          </button>
        </div>

        <button
          onClick={handleApply}
          disabled={!state.refinedCritiqueSuggestion}
          className="w-full text-[11px] font-medium px-3 py-2 rounded-md border border-primary text-primary hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Apply refined suggestion
        </button>
      </div>
    </div>
  );
}
