import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./index.css";

console.log("🔥 JS bundle started");

const root = document.getElementById("root");

if (!root) {
  console.error("❌ Root not found");
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}