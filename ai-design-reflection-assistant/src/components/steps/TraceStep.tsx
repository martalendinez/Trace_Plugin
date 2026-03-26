import { useMemo, useState } from "react";
import { useReflection } from "../../features/reflection/state/ReflectionContext";

export function TraceStep() {
  const { state, dispatch } = useReflection();

  const selectedOption = useMemo(
    () =>
      state.generatedOptions.find(
        (option) => option.id === state.selectedOptionId
      ) ?? null,
    [state.generatedOptions, state.selectedOptionId]
  );

  return (
    <div style={{ display: "grid", gap: 20, paddingBottom: 40 }}>
      {/* HEADER */}
      <div>
        <div style={{ fontSize: 12, color: "#777" }}>Step 6 of 6</div>

        <h1 style={{ fontSize: 22, margin: "6px 0 0" }}>Reflection log</h1>

        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.5 }}>
          Review and refine your decisions. Everything here is editable — click
          any field to update it.
        </p>
      </div>

      {/* EDITABLE CORE FIELDS */}
      <div style={{ display: "grid", gap: 14 }}>
        <EditableTraceCard
          label="Intent (goal)"
          value={state.goal}
          notes={state.goalNotes}
          onSave={(val) =>
            dispatch({ type: "SET_FIELD", field: "goal", value: val })
          }
          onSaveNotes={(val) =>
            dispatch({ type: "SET_FIELD", field: "goalNotes", value: val })
          }
        />

        <EditableTraceCard
          label="Audience"
          value={state.audience}
          notes={state.audienceNotes}
          onSave={(val) =>
            dispatch({ type: "SET_FIELD", field: "audience", value: val })
          }
          onSaveNotes={(val) =>
            dispatch({ type: "SET_FIELD", field: "audienceNotes", value: val })
          }
        />

        <EditableTraceCard
          label="Selected element"
          value={state.selectedElement}
          notes={state.selectedElementNotes}
          onSave={(val) =>
            dispatch({
              type: "SET_FIELD",
              field: "selectedElement",
              value: val,
            })
          }
          onSaveNotes={(val) =>
            dispatch({
              type: "SET_FIELD",
              field: "selectedElementNotes",
              value: val,
            })
          }
        />

        <EditableTraceCard
          label="Product context"
          value={state.productContext}
          notes={state.productContextNotes}
          onSave={(val) =>
            dispatch({
              type: "SET_FIELD",
              field: "productContext",
              value: val,
            })
          }
          onSaveNotes={(val) =>
            dispatch({
              type: "SET_FIELD",
              field: "productContextNotes",
              value: val,
            })
          }
        />
      </div>

      {/* READ-ONLY INFO */}
      <div style={{ display: "grid", gap: 12 }}>
        <TraceCard
          label="Context shared with AI"
          value={
            state.contextSelection.length > 0
              ? state.contextSelection.join(", ")
              : "None"
          }
        />

        <TraceCard
          label="Design stage"
          value={
            state.designStage.length > 0
              ? state.designStage.join(", ")
              : "None"
          }
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

      {/* CHANGES */}
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

      {/* DESIGNER NOTES */}
      <div style={{ display: "grid", gap: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>General notes</span>

        <EditableTextarea
          value={state.designerNotes}
          onSave={(val) =>
            dispatch({
              type: "SET_FIELD",
              field: "designerNotes",
              value: val,
            })
          }
        />
      </div>

      {/* ACTIONS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 12,
        }}
      >
        <button
          onClick={() => dispatch({ type: "PREV_STEP" })}
          style={secondaryButtonStyle}
        >
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

//
// ✨ EDITABLE TRACE CARD (inline editing + notes)
//

function EditableTraceCard({
  label,
  value,
  notes,
  onSave,
  onSaveNotes,
}: {
  label: string;
  value: string;
  notes?: string;
  onSave: (val: string) => void;
  onSaveNotes: (val: string) => void;
}) {
  const [editingValue, setEditingValue] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);

  const [tempValue, setTempValue] = useState(value);
  const [tempNotes, setTempNotes] = useState(notes || "");

  return (
    <div style={traceCardStyle}>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
        {label}
      </div>

      {/* VALUE */}
      {editingValue ? (
        <input
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={() => {
            onSave(tempValue);
            setEditingValue(false);
          }}
          autoFocus
          style={inputStyle}
        />
      ) : (
        <div
          onClick={() => setEditingValue(true)}
          style={{ fontSize: 14, color: "#111", cursor: "text" }}
        >
          {value || "Click to edit"}
        </div>
      )}

      {/* NOTES */}
      <div style={{ marginTop: 8 }}>
        {editingNotes ? (
          <textarea
            value={tempNotes}
            onChange={(e) => setTempNotes(e.target.value)}
            onBlur={() => {
              onSaveNotes(tempNotes);
              setEditingNotes(false);
            }}
            autoFocus
            style={textareaStyle}
          />
        ) : (
          <div
            onClick={() => setEditingNotes(true)}
            style={{ fontSize: 12, color: "#777", cursor: "text" }}
          >
            {notes || "Add notes..."}
          </div>
        )}
      </div>
    </div>
  );
}

//
// ✨ READ-ONLY CARD
//

function TraceCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={traceCardStyle}>
      <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
      <div style={{ fontSize: 14, color: "#111", marginTop: 6 }}>{value}</div>
    </div>
  );
}

//
// ✨ EDITABLE TEXTAREA (general notes)
//

function EditableTextarea({
  value,
  onSave,
}: {
  value: string;
  onSave: (val: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(value);

  return (
    <div style={notesBoxStyle}>
      {editing ? (
        <textarea
          value={temp}
          onChange={(e) => setTemp(e.target.value)}
          onBlur={() => {
            onSave(temp);
            setEditing(false);
          }}
          autoFocus
          style={textareaStyle}
        />
      ) : (
        <div onClick={() => setEditing(true)} style={{ cursor: "text" }}>
          {value || "Click to add notes..."}
        </div>
      )}
    </div>
  );
}

//
// 🔧 STYLES
//

const traceCardStyle: React.CSSProperties = {
  border: "1px solid #e5e5e5",
  borderRadius: 12,
  padding: 14,
  background: "#fcfcfc",
  transition: "border-color 0.15s ease",
};

const notesBoxStyle: React.CSSProperties = {
  border: "1px solid #e5e5e5",
  borderRadius: 12,
  padding: 14,
  background: "#fafafa",
  minHeight: 72,
  fontSize: 14,
  color: "#333",
};

const inputStyle: React.CSSProperties = {
  height: 34,
  borderRadius: 8,
  border: "1px solid #ccc",
  padding: "0 10px",
  fontSize: 14,
};

const textareaStyle: React.CSSProperties = {
  minHeight: 70,
  borderRadius: 8,
  border: "1px solid #ccc",
  padding: "10px",
  fontSize: 13,
};

const changeRowStyle: React.CSSProperties = {
  border: "1px solid #e3e3e3",
  borderRadius: 10,
  padding: "12px",
  background: "#fafafa",
  fontSize: 14,
};

const emptyBoxStyle: React.CSSProperties = {
  border: "1px dashed #cfcfcf",
  borderRadius: 12,
  padding: 16,
  background: "#fafafa",
  color: "#555",
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
  fontWeight: 600,
  cursor: "pointer",
};
