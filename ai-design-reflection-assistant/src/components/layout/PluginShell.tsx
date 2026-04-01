import { useState } from "react";
import type { ReactNode } from "react";
import { Sparkles, PanelRight, X } from "lucide-react";
import { cn } from "../../lib/utils";

interface PluginShellProps {
  children: ReactNode;
}

export function PluginShell({ children }: PluginShellProps) {
  const [panelOpen, setPanelOpen] = useState(true);

  return (
    <div className="h-screen flex bg-background overflow-hidden relative">

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <span className="text-xs">Canvas Area</span>
      </div>

      {/* Assistant Panel */}
      <div
        className={cn(
          "absolute right-0 top-0 h-full w-96 border-l border-border bg-card flex flex-col transition-transform duration-300",
          !panelOpen && "translate-x-full"
        )}
      >
        {/* Panel Header */}
        <div className="h-12 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground tracking-tight">
              Design Reflection
            </span>
          </div>

          {/* Close button (only when panel is open) */}
          {panelOpen && (
            <button
              onClick={() => setPanelOpen(false)}
              className="p-1 rounded-md hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>

      {/* Floating open button (only when panel is closed) */}
      {!panelOpen && (
        <button
          onClick={() => setPanelOpen(true)}
          className="absolute top-3 right-3 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-all"
        >
          <PanelRight className="w-3.5 h-3.5" />
          Panel
        </button>
      )}
    </div>
  );
}
