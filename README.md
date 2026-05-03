# AI Design Reflection Assistant

> **Human thinking first. AI as a reflection partner.**

A six-stage, AI-supported reflection plugin for designers — built to enhance human thinking, not replace it. The tool helps designers articulate intent, provide context, explore options, critique ideas, and document their reasoning. This is a working prototype running on a standalone canvas, designed to eventually integrate with any design platform.

---

## Table of Contents

- [Overview](#overview)
- [Six-Stage Flow](#six-stage-flow)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [License](#license)

---

## Overview

This prototype guides designers through a structured reflection process. It does not generate UI layouts or take over the design process. Instead, it supports designers by:

- Generating options
- Explaining reasoning
- Offering critiques
- Enabling mix-and-match exploration

The system currently runs independently, but the architecture is designed to be connected to external tools (e.g., Figma, Sketch, Penpot) in future iterations.

---

## Six-Stage Flow

### 1. 🎯 Intent

Designers define what they want to achieve.

Examples:
- Improving onboarding
- Simplifying a flow
- Exploring layout alternatives

---

### 2. 📋 Context

Designers provide full context about their design situation. This stage is intentionally open-ended and may include:

- Design stage
- Connected elements
- Constraints
- User problems
- Hypotheses
- References
- Any additional information that helps the model understand the situation

---

### 3. 💡 Options

The system generates **3–5 design options** based on the provided intent and context.

Each option includes:

| Field | Description |
|---|---|
| `title` | Short name for the option |
| `summary` | Brief description of the approach |
| `principle` | The design principle it follows |
| `tradeoff` | What is gained and what is sacrificed |
| `reasoning` | Why this option was suggested |

---

### 4. 🔀 Mix & Match *(Drag and Drop)*

Designers can mix and match ideas across options using a drag-and-drop interface powered by **dnd-kit**. A custom option can be created by combining fields from different options.

Supported draggable fields:
- `title`
- `summary`
- `principle`
- `tradeoff`

---

### 5. 🔍 Critiques

Each option receives AI-generated critiques to help designers reflect more deeply and consider alternative perspectives.

Critique categories include:
- Accessibility
- Usability
- Consistency
- Edge cases
- Risks
- Potential blind spots

---

### 6. 📝 Trace

A final **editable summary** where designers can:
- Refine their chosen direction
- Combine insights from multiple options
- Document their reasoning

This creates a clear, auditable trace of the design decision.

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React | UI framework |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| TailwindCSS | Styling |
| Framer Motion | Animations |
| Lucide React | Icons |
| dnd-kit | Drag-and-drop interactions |
| React Context | Global state management |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express | HTTP server |
| Groq API | LLM-based reasoning & option generation |

### Architecture Notes

- The six-stage flow is managed through a global `ReflectionContext`
- The backend is **stateless** — it receives structured context from the frontend on each request
- The frontend handles reasoning animation, option rendering, drag-and-drop, critiques, and trace editing

---

## Installation

**1. Clone the repository**

```bash
git clone <your-repo-url>
cd ai-design-reflection-assistant
```

**2. Install dependencies**

```bash
npm install
```

**3. Install required libraries**

```bash
npm install @dnd-kit/core lucide-react framer-motion
```

---

## Running the Project

**Start the backend**

```bash
npm run server
```

**Start the frontend**

```bash
npm run dev
```

| Service | URL |
|---|---|
| Backend | http://localhost:3001 |
| Frontend | http://localhost:5173 |

> ⚠️ The backend must be running before the frontend can generate options or critiques.

---

## Current Status

This is a **functional prototype**. It runs on a standalone canvas and is not yet integrated with external design tools.

The long-term goal is to make the plugin connectable to any platform or application.

---

## License

[MIT License](./LICENSE)
