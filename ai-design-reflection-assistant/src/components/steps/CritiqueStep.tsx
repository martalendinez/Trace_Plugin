import { useEffect } from "react";
import { useReflection } from "../../features/reflection/state/ReflectionContext";
import type { CritiqueCategory } from "../../features/reflection/types";

const CATEGORIES: { value: CritiqueCategory; label: string }[] = [
  { value: "accessibility", label: "Accessibility" },
  { value: "edge-cases", label: "Edge cases" },
  { value: "interaction-complexity", label: "Interaction complexity" },
  { value: "consistency", label: "Consistency" },
  { value: "usability", label: "Usability" },
];

export function CritiqueStep() {
  const { state, dispatch } = useReflection();

  useEffect(() => {
    dispatch({ type: "RUN_CRITIQUE" });
  }, [state.activeCritiqueCategories, dispatch]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <div style={{ fontSize: 12, color: "#666" }}>Step 4 of 6</div>
        <h1 style={{ fontSize: 24, margin: "6px 0 0" }}>Critique mode</h1>
        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.5 }}>
          Review potential issues critically. Suggestions should support thinking, not replace it.
        </p>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Consider before continuing</span>
        <div style={{ display: "grid", gap: 10 }}>
          {CATEGORIES.map((category) => (
            <label key={category.value} style={checkboxRowStyle}>
              <input
                type="checkbox"
                checked={state.activeCritiqueCategories.includes(category.value)}
                onChange={() =>
                  dispatch({
                    type: "TOGGLE_CRITIQUE_CATEGORY",
                    value: category.value,
                  })
                }
              />
              <span>{category.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {state.critiques.length === 0 ? (
          <div style={emptyBoxStyle}>
            <p style={{ margin: 0, fontSize: 14, color: "#555" }}>
              No critique items available. Select at least one critique category.
            </p>
          </div>
        ) : (
          state.critiques.map((critique) => (
            <div key={critique.id} style={cardStyle}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{critique.title}</div>
              <div style={{ fontSize: 14, color: "#444", lineHeight: 1.5 }}>
                {critique.concern}
              </div>
              <div style={{ fontSize: 14, color: "#222" }}>
                <strong>Suggested improvement:</strong> {critique.suggestion}
              </div>
              <div style={{ fontSize: 12, color: "#777" }}>
                <strong>Uncertainty:</strong> {critique.uncertaintyNote}
              </div>
            </div>
          ))
        )}
      </div>

      <label style={{ display: "grid", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Write your own improvement</span>
        <textarea
          value={state.ownImprovement}
          onChange={(e) =>
            dispatch({
              type: "SET_FIELD",
              field: "ownImprovement",
              value: e.target.value,
            })
          }
          placeholder="Add your own response to the critique..."
          style={textareaStyle}
        />
      </label>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <button onClick={() => dispatch({ type: "PREV_STEP" })} style={secondaryButtonStyle}>
          Back
        </button>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => dispatch({ type: "ADD_OWN_IMPROVEMENT" })} style={secondaryButtonStyle}>
            Apply improvement
          </button>
          <button onClick={() => dispatch({ type: "NEXT_STEP" })} style={primaryButtonStyle}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

const checkboxRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  border: "1px solid #e3e3e3",
  borderRadius: 10,
  padding: "10px 12px",
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #dddddd",
  borderRadius: 12,
  padding: 14,
  display: "grid",
  gap: 8,
  background: "#fafafa",
};

const emptyBoxStyle: React.CSSProperties = {
  border: "1px dashed #cfcfcf",
  borderRadius: 12,
  padding: 16,
  background: "#fafafa",
};

const textareaStyle: React.CSSProperties = {
  minHeight: 88,
  borderRadius: 10,
  border: "1px solid #d7d7d7",
  padding: "12px",
  resize: "vertical",
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