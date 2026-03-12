import { useMemo } from "react";
import { useReflection } from "../../features/reflection/state/ReflectionContext";

export function ApplyStep() {
  const { state, dispatch } = useReflection();

  const selectedOption = useMemo(
    () => state.generatedOptions.find((option) => option.id === state.selectedOptionId) ?? null,
    [state.generatedOptions, state.selectedOptionId]
  );

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <div style={{ fontSize: 12, color: "#666" }}>Step 5 of 6</div>
        <h1 style={{ fontSize: 24, margin: "6px 0 0" }}>Apply changes</h1>
        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.5 }}>
          Review proposed changes before applying them. The designer remains in control.
        </p>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Selected option</span>
        <div style={readonlyBoxStyle}>
          {selectedOption ? selectedOption.title : "No option selected"}
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Suggested changes</span>

        {!selectedOption ? (
          <div style={emptyBoxStyle}>No selected option available.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {selectedOption.suggestedChanges.map((change) => (
              <div key={change} style={cardStyle}>
                <div style={{ fontSize: 14, color: "#333", lineHeight: 1.5 }}>{change}</div>
                <div>
                  <button
                    onClick={() =>
                      dispatch({
                        type: "APPLY_CHANGE",
                        value: change,
                      })
                    }
                    style={secondaryButtonStyle}
                  >
                    Apply change
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Changes ready to apply</span>

        {state.appliedChanges.length === 0 ? (
          <div style={emptyBoxStyle}>No applied changes yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {state.appliedChanges.map((change, index) => (
              <div key={`${change}-${index}`} style={appliedRowStyle}>
                <span style={{ fontSize: 14 }}>{change}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
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

const readonlyBoxStyle: React.CSSProperties = {
  minHeight: 42,
  display: "flex",
  alignItems: "center",
  borderRadius: 10,
  border: "1px solid #d7d7d7",
  padding: "0 12px",
  background: "#fafafa",
};

const emptyBoxStyle: React.CSSProperties = {
  border: "1px dashed #cfcfcf",
  borderRadius: 12,
  padding: 16,
  background: "#fafafa",
  color: "#555",
  fontSize: 14,
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #dddddd",
  borderRadius: 12,
  padding: 14,
  display: "grid",
  gap: 10,
  background: "#fff",
};

const appliedRowStyle: React.CSSProperties = {
  border: "1px solid #e3e3e3",
  borderRadius: 10,
  padding: "12px",
  background: "#fafafa",
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