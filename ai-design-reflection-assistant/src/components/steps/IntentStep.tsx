import { useReflection } from "../../features/reflection/state/ReflectionContext";
import Tooltip from "../../components/Tooltip";

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
    <div style={{ display: "grid", gap: 20, maxWidth: 700 }}>
      
      {/* HEADER */}
      <div>
        <div style={{ fontSize: 12, color: "#666" }}>Step 1 of 6</div>

        <h1 style={{ fontSize: 26, margin: "6px 0 0" }}>
          Explain your design intent
        </h1>

        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.6 }}>
          Describe what you're trying to achieve so the AI can give more relevant and useful feedback.
        </p>
      </div>

      {/* TASK TYPE */}
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          Task type
          <Tooltip text="What kind of help you want from the AI." />
        </span>

        <span style={{ fontSize: 12, color: "#777" }}>
          Select the type of support you need.
        </span>

        <select
          value={state.taskMode}
          onChange={(e) =>
            dispatch({
              type: "SET_FIELD",
              field: "taskMode",
              value: e.target.value,
            })
          }
          style={{
            height: 42,
            borderRadius: 10,
            border: "1px solid #d7d7d7",
            padding: "0 12px",
          }}
        >
          {TASK_MODES.map((mode) => (
            <option key={mode.value} value={mode.value}>
              {mode.label}
            </option>
          ))}
        </select>
      </label>

      {/* GOAL */}
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          What is your goal?
          <Tooltip text="Describe what you want this design to achieve." />
        </span>

        <span style={{ fontSize: 12, color: "#777" }}>
          What should users be able to do or achieve?
        </span>

        <input
          value={state.goal}
          placeholder="e.g. Help users quickly book a table with minimal friction"
          onChange={(e) =>
            dispatch({
              type: "SET_FIELD",
              field: "goal",
              value: e.target.value,
            })
          }
          style={{
            height: 42,
            borderRadius: 10,
            border: "1px solid #d7d7d7",
            padding: "0 12px",
          }}
        />
      </label>

      {/* AUDIENCE */}
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          Who is this for?
          <Tooltip text="Define your target users so feedback is more relevant." />
        </span>

        <span style={{ fontSize: 12, color: "#777" }}>
          Who are you designing for?
        </span>

        <input
          value={state.audience}
          placeholder="e.g. Young professionals booking restaurants on mobile"
          onChange={(e) =>
            dispatch({
              type: "SET_FIELD",
              field: "audience",
              value: e.target.value,
            })
          }
          style={{
            height: 42,
            borderRadius: 10,
            border: "1px solid #d7d7d7",
            padding: "0 12px",
          }}
        />
      </label>

      {/* ACTION */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
        <button
          onClick={() => dispatch({ type: "NEXT_STEP" })}
          style={{
            height: 42,
            padding: "0 18px",
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