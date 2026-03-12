import { useReflection } from "../../features/reflection/state/ReflectionContext";
import type { ContextItem, DesignStage } from "../../features/reflection/types";

const DESIGN_STAGES: { value: DesignStage; label: string }[] = [
  { value: "research", label: "Research" },
  { value: "wireframe", label: "Wireframe" },
  { value: "early-concept", label: "Early concept" },
  { value: "high-fidelity", label: "High fidelity" },
];

const CONTEXT_OPTIONS: { value: ContextItem; label: string; sensitive?: boolean }[] = [
  { value: "selected-ui", label: "Selected UI frame" },
  { value: "button-labels", label: "Button labels" },
  { value: "input-fields", label: "Input fields" },
  { value: "user-research", label: "User research", sensitive: true },
  { value: "internal-docs", label: "Internal documentation", sensitive: true },
];

export function ContextStep() {
  const { state, dispatch } = useReflection();

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <div style={{ fontSize: 12, color: "#666" }}>Step 2 of 6</div>
        <h1 style={{ fontSize: 24, margin: "6px 0 0" }}>Context selection</h1>
        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.5 }}>
          Help the AI understand the design situation before generating ideas.
        </p>
      </div>

      <label style={{ display: "grid", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Selected design element</span>
        <input
          value={state.selectedElement}
          onChange={(e) =>
            dispatch({
              type: "SET_FIELD",
              field: "selectedElement",
              value: e.target.value,
            })
          }
          style={inputStyle}
        />
      </label>

      <label style={{ display: "grid", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Product context</span>
        <input
          value={state.productContext}
          onChange={(e) =>
            dispatch({
              type: "SET_FIELD",
              field: "productContext",
              value: e.target.value,
            })
          }
          style={inputStyle}
        />
      </label>

      <div style={{ display: "grid", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Design stage</span>
        <div style={{ display: "grid", gap: 10 }}>
          {DESIGN_STAGES.map((stage) => (
            <label key={stage.value} style={checkboxRowStyle}>
              <input
                type="checkbox"
                checked={state.designStage.includes(stage.value)}
                onChange={() =>
                  dispatch({
                    type: "TOGGLE_STAGE",
                    value: stage.value,
                  })
                }
              />
              <span>{stage.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Select elements for AI</span>
        <div style={{ display: "grid", gap: 10 }}>
          {CONTEXT_OPTIONS.map((item) => (
            <label key={item.value} style={checkboxRowStyle}>
              <input
                type="checkbox"
                checked={state.contextSelection.includes(item.value)}
                onChange={() =>
                  dispatch({
                    type: "TOGGLE_CONTEXT",
                    value: item.value,
                  })
                }
              />
              <div style={{ display: "grid", gap: 2 }}>
                <span>{item.label}</span>
                {item.sensitive && (
                  <span style={{ fontSize: 12, color: "#777" }}>
                    Sensitive — include only if needed
                  </span>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      <label style={{ display: "grid", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Additional context</span>
        <textarea
          value={state.designerNotes}
          onChange={(e) =>
            dispatch({
              type: "SET_FIELD",
              field: "designerNotes",
              value: e.target.value,
            })
          }
          style={textareaStyle}
        />
      </label>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
        <button onClick={() => dispatch({ type: "PREV_STEP" })} style={secondaryButtonStyle}>
          Back
        </button>
        <button onClick={() => dispatch({ type: "NEXT_STEP" })} style={primaryButtonStyle}>
          Continue
        </button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  height: 42,
  borderRadius: 10,
  border: "1px solid #d7d7d7",
  padding: "0 12px",
};

const textareaStyle: React.CSSProperties = {
  minHeight: 88,
  borderRadius: 10,
  border: "1px solid #d7d7d7",
  padding: "12px",
  resize: "vertical",
};

const checkboxRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  border: "1px solid #e3e3e3",
  borderRadius: 10,
  padding: "10px 12px",
};

const primaryButtonStyle: React.CSSProperties = {
  height: 42,
  padding: "0 16px",
  borderRadius: 10,
  border: "none",
  background: "#111",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  height: 42,
  padding: "0 16px",
  borderRadius: 10,
  border: "1px solid #d7d7d7",
  background: "#fff",
  color: "#111",
  fontWeight: 600,
  cursor: "pointer",
};