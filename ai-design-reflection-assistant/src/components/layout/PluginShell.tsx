import { useState } from "react";
import type { ReactNode } from "react";
import { Sparkles, PanelRight, X } from "lucide-react";
import { cn } from "../../lib/utils";
import StepNavigator from "./StepNavigator";

interface PluginShellProps {
  children: ReactNode;
}

export function PluginShell({ children }: PluginShellProps) {
  const [panelOpen, setPanelOpen] = useState(true);

  return (
    <div className="h-screen flex bg-background overflow-hidden overflow-x-hidden">

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
            <div className="w-5 h-5 rounded-full border border-primary/40 bg-primary/15 flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-primary stroke-[1.5]" />
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold text-foreground tracking-tight">
                Design Reflection
              </span>
              <span className="text-[11px] text-muted-foreground">
                AI Assistant
              </span>
            </div>
          </div>

          {panelOpen && (
            <button
              onClick={() => setPanelOpen(false)}
              className="p-1 rounded-md hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Step Navigation */}
        <StepNavigator />

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto panel-scroll">
          {children}
        </div>
      </div>

      {/* Floating open button */}
      {!panelOpen && (
        <button
          onClick={() => setPanelOpen(true)}
          className="absolute top-3 right-3 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-card border border-border text-muted-foreground hover:text-foreground shadow-sm transition-all"
        >
          <PanelRight className="w-3.5 h-3.5" />
          Panel
        </button>
      )}
    </div>
  );
}
