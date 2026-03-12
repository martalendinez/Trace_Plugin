import { useReflection } from "../../features/reflection/state/ReflectionContext";

const TASK_MODES = [
  { value: "generate-ideas", label: "Generate ideas" },
  { value: "critique-design", label: "Critique design" },
  { value: "improve-accessibility", label: "Improve accessibility" },
  { value: "write-ux-copy", label: "Write UX copy" },
  { value: "plan-interaction", label: "Plan interaction" },
] as const;

export function IntentStep() {
  const { state, dispatch } = useReflection();

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <div style={{ fontSize: 12, color: "#666" }}>Step 1 of 6</div>
        <h1 style={{ fontSize: 24, margin: "6px 0 0" }}>Define intent</h1>
        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.5 }}>
          Before using AI, define what you want to achieve.
        </p>
      </div>

      <label style={{ display: "grid", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Task mode</span>
        <select
          value={state.taskMode}
          onChange={(e) =>
            dispatch({
              type: "SET_FIELD",
              field: "taskMode",
              value: e.target.value,
            })
          }
          style={{ height: 42, borderRadius: 10, border: "1px solid #d7d7d7", padding: "0 12px" }}
        >
          {TASK_MODES.map((mode) => (
            <option key={mode.value} value={mode.value}>
              {mode.label}
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: "grid", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Goal</span>
        <input
          value={state.goal}
          onChange={(e) =>
            dispatch({
              type: "SET_FIELD",
              field: "goal",
              value: e.target.value,
            })
          }
          style={{ height: 42, borderRadius: 10, border: "1px solid #d7d7d7", padding: "0 12px" }}
        />
      </label>

      <label style={{ display: "grid", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Audience</span>
        <input
          value={state.audience}
          onChange={(e) =>
            dispatch({
              type: "SET_FIELD",
              field: "audience",
              value: e.target.value,
            })
          }
          style={{ height: 42, borderRadius: 10, border: "1px solid #d7d7d7", padding: "0 12px" }}
        />
      </label>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
        <button
          onClick={() => dispatch({ type: "NEXT_STEP" })}
          style={{
            height: 42,
            padding: "0 16px",
            borderRadius: 10,
            border: "none",
            background: "#111",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}