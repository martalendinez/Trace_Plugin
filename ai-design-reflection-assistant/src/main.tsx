import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./index.css"; // ← Load Base44 design tokens + Tailwind layers

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
