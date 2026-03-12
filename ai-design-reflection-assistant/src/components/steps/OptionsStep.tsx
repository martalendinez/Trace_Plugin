import { useMemo, useState } from "react";
import { useReflection } from "../../features/reflection/state/ReflectionContext";

export function OptionsStep() {
  const { state, dispatch } = useReflection();
  const [openReasoningId, setOpenReasoningId] = useState<string | null>(null);

  const selectedOption = useMemo(
    () => state.generatedOptions.find((option) => option.id === state.selectedOptionId) ?? null,
    [state.generatedOptions, state.selectedOptionId]
  );

  const handleGenerate = () => {
    dispatch({ type: "GENERATE_OPTIONS" });
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <div style={{ fontSize: 12, color: "#666" }}>Step 3 of 6</div>
        <h1 style={{ fontSize: 24, margin: "6px 0 0" }}>Options</h1>
        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.5 }}>
          Generate multiple candidate directions instead of one “correct” answer.
        </p>
      </div>

      {state.generatedOptions.length === 0 ? (
        <div style={emptyBoxStyle}>
          <p style={{ margin: 0, fontSize: 14, color: "#555" }}>
            No options generated yet. Click below to create design directions.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {state.generatedOptions.map((option) => {
            const isSelected = state.selectedOptionId === option.id;
            const isOpen = openReasoningId === option.id;

            return (
              <div
                key={option.id}
                style={{
                  border: isSelected ? "1.5px solid #111" : "1px solid #dcdcdc",
                  borderRadius: 12,
                  padding: 14,
                  background: isSelected ? "#fafafa" : "#fff",
                  display: "grid",
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>{option.title}</div>
                  <div style={{ fontSize: 14, color: "#555", marginTop: 4 }}>
                    {option.summary}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={() =>
                      dispatch({
                        type: "SELECT_OPTION",
                        value: option.id,
                      })
                    }
                    style={isSelected ? primaryButtonStyle : secondaryButtonStyle}
                  >
                    {isSelected ? "Selected" : "Select"}
                  </button>

                  <button
                    onClick={() =>
                      setOpenReasoningId((prev) => (prev === option.id ? null : option.id))
                    }
                    style={secondaryButtonStyle}
                  >
                    {isOpen ? "Hide reasoning" : "View reasoning"}
                  </button>
                </div>

                {isOpen && (
                  <div style={reasoningBoxStyle}>
                    <div><strong>Problem:</strong> {option.problem}</div>
                    <div><strong>Assumption:</strong> {option.assumption}</div>
                    <div><strong>Design principle:</strong> {option.principle}</div>
                    <div><strong>Trade-off:</strong> {option.tradeoff}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedOption && (
        <div style={infoBoxStyle}>
          <div style={{ fontSize: 13, color: "#666" }}>Currently selected</div>
          <div style={{ fontWeight: 700, marginTop: 4 }}>{selectedOption.title}</div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <button onClick={() => dispatch({ type: "PREV_STEP" })} style={secondaryButtonStyle}>
          Back
        </button>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleGenerate} style={secondaryButtonStyle}>
            Generate
          </button>
          <button
            onClick={() => dispatch({ type: "NEXT_STEP" })}
            style={primaryButtonStyle}
            disabled={state.generatedOptions.length === 0}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

const emptyBoxStyle: React.CSSProperties = {
  border: "1px dashed #cfcfcf",
  borderRadius: 12,
  padding: 16,
  background: "#fafafa",
};

const infoBoxStyle: React.CSSProperties = {
  border: "1px solid #e3e3e3",
  borderRadius: 12,
  padding: 14,
  background: "#fafafa",
};

const reasoningBoxStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  fontSize: 13,
  color: "#444",
  borderRadius: 10,
  background: "#f5f5f5",
  padding: 12,
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