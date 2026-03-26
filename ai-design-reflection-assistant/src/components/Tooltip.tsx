import { useState } from "react";

export default function Tooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        marginLeft: 6,
        cursor: "pointer",
        color: "#888",
      }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      ⓘ

      {visible && (
        <div
          style={{
            position: "absolute",
            top: "120%",
            left: 0,
            background: "#111",
            color: "#fff",
            padding: "8px 10px",
            borderRadius: 6,
            fontSize: 12,
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          {text}
        </div>
      )}
    </span>
  );
}