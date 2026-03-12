import type { PropsWithChildren } from "react";
import "../../styles/plugin.css";

export function PluginShell({ children }: PropsWithChildren) {
  return (
    <div className="plugin-root">
      <div className="plugin-window">
        <div className="plugin-titlebar">
          <div className="plugin-dots">
            <span />
            <span />
            <span />
          </div>
          <div className="plugin-title">AI Design Reflection Assistant</div>
        </div>
        <div className="plugin-body">{children}</div>
      </div>
    </div>
  );
}