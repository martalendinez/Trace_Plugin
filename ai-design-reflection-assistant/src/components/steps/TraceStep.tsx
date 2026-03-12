import { useMemo } from "react";
import { useReflection } from "../../features/reflection/state/ReflectionContext";

export function TraceStep() {
  const { state, dispatch } = useReflection();

  const selectedOption = useMemo(
    () => state.generatedOptions.find((option) => option.id === state.selectedOptionId) ?? null,
    [state.generatedOptions, state.selectedOptionId]
  );

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <div style={{ fontSize: 12, color: "#666" }}>Step 6 of 6</div>
        <h1 style={{ fontSize: 24, margin: "6px 0 0" }}>Trace log</h1>
        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.5 }}>
          This log records intent, context, critique, and final design decisions.
        </p>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        <TraceCard label="Intent" value={state.goal} />
        <TraceCard label="Audience" value={state.audience} />
        <TraceCard label="Selected element" value={state.selectedElement} />
        <TraceCard label="Product context" value={state.productContext} />
        <TraceCard
          label="Context shared with AI"
          value={state.contextSelection.length > 0 ? state.contextSelection.join(", ") : "None"}
        />
        <TraceCard
          label="Design stage"
          value={state.designStage.length > 0 ? state.designStage.join(", ") : "None"}
        />
        <TraceCard
          label="Options generated"
          value={`${state.generatedOptions.length} option(s)`}
        />
        <TraceCard
          label="Selected option"
          value={selectedOption ? selectedOption.title : "None"}
        />
        <TraceCard
          label="Critiques reviewed"
          value={`${state.critiques.length} critique item(s)`}
        />
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Changes applied</span>

        {state.appliedChanges.length === 0 ? (
          <div style={emptyBoxStyle}>No changes were recorded.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {state.appliedChanges.map((change, index) => (
              <div key={`${change}-${index}`} style={changeRowStyle}>
                • {change}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Designer notes</span>
        <div style={notesBoxStyle}>
          {state.designerNotes || "No notes added."}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <button onClick={() => dispatch({ type: "PREV_STEP" })} style={secondaryButtonStyle}>
          Back
        </button>
        <button
          onClick={() => alert("Prototype complete ✨")}
          style={primaryButtonStyle}
        >
          Finish
        </button>
      </div>
    </div>
  );
}

function TraceCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={traceCardStyle}>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: "#111", lineHeight: 1.5 }}>{value}</div>
    </div>
  );
}

const traceCardStyle: React.CSSProperties = {
  border: "1px solid #e3e3e3",
  borderRadius: 12,
  padding: 14,
  background: "#fff",
};

const notesBoxStyle: React.CSSProperties = {
  border: "1px solid #d7d7d7",
  borderRadius: 12,
  padding: 14,
  background: "#fafafa",
  minHeight: 72,
  fontSize: 14,
  color: "#333",
  lineHeight: 1.5,
};

const changeRowStyle: React.CSSProperties = {
  border: "1px solid #e3e3e3",
  borderRadius: 10,
  padding: "12px",
  background: "#fafafa",
  fontSize: 14,
  color: "#333",
};

const emptyBoxStyle: React.CSSProperties = {
  border: "1px dashed #cfcfcf",
  borderRadius: 12,
  padding: 16,
  background: "#fafafa",
  color: "#555",
  fontSize: 14,
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