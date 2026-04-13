import { useState } from "react";
import type { ReactNode } from "react";
import { PanelRight } from "lucide-react";
import { cn } from "../../lib/utils";
import StepNavigator from "./StepNavigator";

interface PluginShellProps {
  children: ReactNode;
}

export function PluginShell({ children }: PluginShellProps) {
  const [panelOpen, setPanelOpen] = useState(true);

  return (
    <div className="h-screen w-screen bg-background overflow-hidden relative">

      {/* Assistant Panel */}
      <div
        className={cn(
          "absolute right-0 top-0 h-full w-96 border-l border-border bg-card flex flex-col transition-transform duration-300",
          !panelOpen && "translate-x-full"
        )}
      >
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
