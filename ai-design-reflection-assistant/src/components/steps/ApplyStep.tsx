import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Plus, Sparkles, ArrowUp } from "lucide-react";
import { cn } from "../../lib/utils";
import { useReflection } from "../../features/reflection/state/ReflectionContext";

export function ApplyStep() {
  const { state, dispatch } = useReflection();

  const [customText, setCustomText] = useState("");
  const [chatInput, setChatInput] = useState("");

  const improvements = state.improvements;
  const chatMessages = state.refinementChat;

  const addCustom = () => {
    if (!customText.trim()) return;
    dispatch({ type: "ADD_IMPROVEMENT", text: customText.trim() });
    setCustomText("");
  };

  const toggleApply = (id: string) => {
    dispatch({ type: "TOGGLE_IMPROVEMENT_APPLIED", id });
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;

    dispatch({
      type: "ADD_REFINEMENT_MESSAGE",
      message: { role: "user", content: chatInput.trim() },
    });

    dispatch({
      type: "ADD_REFINEMENT_MESSAGE",
      message: {
        role: "assistant",
        content:
          "Good suggestion. I've refined the improvement to be more specific — you can apply it directly to the canvas.",
      },
    });

    setChatInput("");
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
        <h3 className="text-sm font-semibold text-foreground">Improvements</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Apply or refine suggested changes.
        </p>
      </div>

      {/* IMPROVEMENT LIST */}
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
                "w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200",
                imp.applied
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-border hover:border-muted-foreground/50"
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

      {/* ADD CUSTOM */}
      <div className="flex items-center gap-2">
        <input
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustom()}
          placeholder="Write your own improvement..."
          className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs outline-none placeholder:text-muted-foreground/50"
        />
        <button
          onClick={addCustom}
          disabled={!customText.trim()}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0",
            customText.trim()
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* REFINEMENT CHAT */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="px-3 py-2 border-b border-border flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Refinement Chat
          </span>
        </div>

        <div className="max-h-[160px] overflow-y-auto panel-scroll p-3 space-y-2">
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "text-xs leading-relaxed px-3 py-2 rounded-lg max-w-[90%]",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground ml-auto"
                  : "bg-muted text-foreground"
              )}
            >
              {msg.content}
            </div>
          ))}
        </div>

        <div className="p-2 border-t border-border">
          <div className="flex items-center gap-1.5 bg-muted rounded-lg px-2.5 py-1.5">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleChatSend();
                }
              }}
              placeholder="Refine an improvement..."
              className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/60"
            />
            <button
              onClick={handleChatSend}
              disabled={!chatInput.trim()}
              className={cn(
                "w-5 h-5 rounded flex items-center justify-center transition-all",
                chatInput.trim()
                  ? "bg-primary text-primary-foreground"
                  : "bg-border text-muted-foreground"
              )}
            >
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* APPLY BUTTON */}
      <button
        disabled={!improvements.some((i) => i.applied)}
        onClick={() => dispatch({ type: "NEXT_STEP" })}
        className={cn(
          "w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2",
          improvements.some((i) => i.applied)
            ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:shadow-md"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        )}
      >
        <Sparkles className="w-3.5 h-3.5" />
        Apply to Canvas
      </button>
    </motion.div>
  );
}
