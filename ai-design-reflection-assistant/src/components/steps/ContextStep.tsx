import { useReflection } from "../../features/reflection/state/ReflectionContext";
import type { ContextItem, DesignStage } from "../../features/reflection/types";
import Tooltip from "../../components/Tooltip";

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
    <div style={{ display: "grid", gap: 20, maxWidth: 700 }}>
      
      {/* HEADER */}
      <div>
        <div style={{ fontSize: 12, color: "#666" }}>Step 2 of 6</div>

        <h1 style={{ fontSize: 26, margin: "6px 0 0" }}>
          Provide design context
        </h1>

        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.6 }}>
          Help the AI understand your design so it can give more relevant and accurate feedback.
        </p>
      </div>

      {/* SELECTED ELEMENT */}
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          What part of the design are you working on?
          <Tooltip text="Describe the specific screen or component you want feedback on." />
        </span>

        <input
          value={state.selectedElement}
          placeholder="e.g. Checkout screen, navigation bar, booking form"
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

      {/* PRODUCT CONTEXT */}
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          What is this product or feature?
          <Tooltip text="Explain what your product does and the context of this design." />
        </span>

        <input
          value={state.productContext}
          placeholder="e.g. A mobile app for booking restaurants"
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

      {/* DESIGN STAGE */}
      <div style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          What stage are you in?
          <Tooltip text="This helps the AI adapt feedback to your design process." />
        </span>

        <span style={{ fontSize: 12, color: "#777" }}>
          Select the stage that best matches your current work.
        </span>

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

      {/* CONTEXT FOR AI */}
      <div style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          What information should the AI use?
          <Tooltip text="Select what parts of your design or research should be considered." />
        </span>

        <span style={{ fontSize: 12, color: "#777" }}>
          This simulates what the AI has access to (e.g. from Figma or documents).
        </span>

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
                    Sensitive — include only if necessary
                  </span>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* ADDITIONAL CONTEXT */}
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          Anything else the AI should know?
          <Tooltip text="Add any extra details that might influence the feedback." />
        </span>

        <textarea
          value={state.designerNotes}
          placeholder="e.g. Users often struggle with this step based on usability tests"
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

      {/* ACTIONS */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
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