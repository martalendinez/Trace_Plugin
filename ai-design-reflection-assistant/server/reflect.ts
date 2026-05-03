import { Router } from "express";
import Groq from "groq-sdk";
import crypto from "crypto";

const router = Router();

/* -------------------------------------------------------
   DESIGN STAGE BEHAVIOR — UPDATED FOR ALL NEW STAGES
-------------------------------------------------------- */
const buildDesignStageBehavior = (designStage: string[]) => `
Design stage behavior rules:

If stage includes "problem-definition":
- Focus on clarifying the problem, constraints, user needs, and assumptions.
- Avoid UI-level feedback.

If stage includes "user-flows":
- Focus on flow logic, task completion, friction points, and missing steps.
- Avoid visual or layout feedback.

If stage includes "low-fidelity":
- Focus on structure, layout intent, and conceptual clarity.
- Avoid detailed UI polish.

If stage includes "wireframe":
- Focus on hierarchy, navigation, clarity, and usability.
- Avoid visual styling feedback.

If stage includes "mid-fidelity":
- Focus on layout refinement, spacing, clarity, and interaction patterns.
- Light visual feedback allowed.

If stage includes "high-fidelity":
- Focus on visual polish, spacing, accessibility, hierarchy, and consistency.

If stage includes "prototype":
- Focus on interaction flow, transitions, affordances, and user expectations.

If stage includes "usability-testing":
- Focus on identifying usability risks, confusion points, and testable hypotheses.

Selected design stage:
${designStage.join(", ")}
`;

/* -------------------------------------------------------
   MAIN REFLECTION  ⭐ includes anythingElse
-------------------------------------------------------- */
router.post("/", async (req, res) => {
  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const {
      goal,
      audience,
      productContext,
      designStage = [],
      contextSelection = [],
      selectedOption,
      activeCritiqueCategories = [],
      anythingElse = "",
    } = req.body;

    const categories =
      activeCritiqueCategories.length > 0
        ? activeCritiqueCategories.join(", ")
        : "accessibility, usability, edge-cases";

    const prompt = `
You are a senior UX design assistant.

Return STRICT JSON only.

${buildDesignStageBehavior(designStage)}

Selected option:
${selectedOption ? JSON.stringify(selectedOption, null, 2) : "None"}

Critique categories:
${categories}

Goal: ${goal}
Audience: ${audience}
Product context: ${productContext}
Context: ${contextSelection.join(", ")}

Additional considerations from the user:
${anythingElse || "None"}

You MUST incorporate these additional considerations into:
- your critiques
- your concerns
- your suggestions
- your improvements
- your changeInstructions

If the user mentions accessibility needs (e.g., visual impairments, color blindness, cognitive load, motor limitations),
you MUST prioritize accessibility issues and highlight them clearly.

Return:

{
  "options": [],
  "critiques": [
    {
      "id": "string",
      "category": "string",
      "title": "short issue",
      "concern": "explanation",
      "suggestion": "improvement",
      "uncertaintyNote": "note"
    }
  ],
  "improvements": [],
  "changeInstructions": []
}
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are a UX expert." },
        { role: "user", content: prompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const data = JSON.parse(raw);

    return res.json({
      critiques: (data.critiques || []).map((c: any) => ({
        id: c.id || crypto.randomUUID(),
        category: c.category || "usability",
        title: c.title || "",
        concern: c.concern || "",
        suggestion: c.suggestion || "",
        uncertaintyNote: c.uncertaintyNote || "",
      })),

      improvements: (data.improvements || []).map((i: any) => ({
        id: crypto.randomUUID(),
        text: typeof i === "string" ? i : i?.text || "",
        applied: false,
      })),

      changeInstructions: (data.changeInstructions || []).map((ci: any) => ({
        type: ci.type,
        nodeId: ci.nodeId || "",
        value: ci.value || "",
        color: ci.color,
        width: ci.width,
        height: ci.height,
      })),

      options: data.options || [],
    });
  } catch (err) {
    console.error("Error in /api/reflect:", err);
    return res.status(500).json({ error: "Failed reflection" });
  }
});

/* -------------------------------------------------------
   OPTIONS  ⭐ NOW INCLUDES anythingElse + UX‑GOOD QUALITY
-------------------------------------------------------- */
router.post("/options", async (req, res) => {
  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const {
      goal,
      audience,
      productContext,
      designStage = [],
      contextSelection = [],
      anythingElse = "",
    } = req.body;

    const prompt = `
You are a senior UX designer generating **high‑quality design options**.

Return STRICT JSON only.

${buildDesignStageBehavior(designStage)}

You MUST generate **3–5 strong UX options**.
Each option MUST be:
- grounded in UX principles
- realistic and implementable
- clearly differentiated
- not generic
- not repetitive
- not vague

You MUST incorporate the user's additional considerations into the options.
If the user mentions accessibility needs (e.g., visual impairments, color blindness, cognitive load, motor limitations),
you MUST prioritize accessibility in:
- the problem framing
- the assumptions
- the UX principles
- the suggested changes

Additional considerations from the user:
${anythingElse || "None"}

Each option MUST include:
- id
- title
- summary
- problem
- assumption
- principle
- tradeoff
- suggestedChanges (list of concrete UX changes)

Return JSON:

{
  "options": [
    {
      "id": "string",
      "title": "string",
      "summary": "string",
      "problem": "string",
      "assumption": "string",
      "principle": "string",
      "tradeoff": "string",
      "suggestedChanges": ["string"]
    }
  ]
}

Goal: ${goal}
Audience: ${audience}
Product context: ${productContext}
Context: ${contextSelection.join(", ")}
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are a UX expert." },
        { role: "user", content: prompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const data = JSON.parse(raw);

    return res.json({
      options: (data.options || []).map((o: any) => ({
        id: o.id || crypto.randomUUID(),
        title: o.title || "Untitled",
        summary: o.summary || "",
        problem: o.problem || "",
        assumption: o.assumption || "",
        principle: o.principle || "",
        tradeoff: o.tradeoff || "",
        suggestedChanges: o.suggestedChanges || [],
      })),
    });
  } catch (err) {
    console.error("Error in /options:", err);
    return res.status(500).json({ error: "Failed options" });
  }
});

/* -------------------------------------------------------
   IMPROVEMENTS  ⭐ unchanged
-------------------------------------------------------- */
router.post("/improvements", async (req, res) => {
  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const {
      goal,
      audience,
      productContext,
      designStage = [],
      contextSelection = [],
      selectedOption,
    } = req.body;

    const safeOption =
      selectedOption && Object.keys(selectedOption).length > 0
        ? JSON.stringify(selectedOption, null, 2)
        : "No specific option selected — generate general UX improvements for this product.";

    const prompt = `
You are a UX expert.

Generate ONLY improvements (NO critiques).

Return JSON:

{
  "improvements": [
    {
      "id": "string",
      "text": "clear actionable improvement",
      "applied": false
    }
  ]
}

Rules:
- ALWAYS generate improvements even if no option is selected
- If no option is selected, generate general UX improvements
- 5–10 improvements
- Focus on usability, clarity, accessibility, flow

${buildDesignStageBehavior(designStage)}

Selected option:
${safeOption}

Goal: ${goal}
Audience: ${audience}
ProductContext: ${productContext}
Context: ${contextSelection.join(", ")}
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are a UX expert." },
        { role: "user", content: prompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const data = JSON.parse(raw);

    return res.json({
      improvements: (data.improvements || []).map((i: any) => ({
        id: crypto.randomUUID(),
        text: i.text || "",
        applied: false,
      })),
    });
  } catch (err) {
    console.error("Error in /improvements:", err);
    return res.status(500).json({ error: "Failed improvements" });
  }
});

/* -------------------------------------------------------
   REFINE OPTION
-------------------------------------------------------- */
router.post("/refine-option", async (req, res) => {
  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const { option, messages = [], goal, audience, productContext } = req.body;

    const prompt = `
Return JSON:

{
  "assistantMessage": "",
  "refinedOption": null
}

Option:
${JSON.stringify(option)}

Messages:
${JSON.stringify(messages)}

Goal: ${goal}
Audience: ${audience}
Product: ${productContext}
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are a UX expert." },
        { role: "user", content: prompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const data = JSON.parse(raw);

    return res.json({
      assistantMessage: data.assistantMessage || "",
      refinedOption: data.refinedOption || null,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed refine-option" });
  }
});

/* -------------------------------------------------------
   CRITIQUE DISCUSS
-------------------------------------------------------- */
router.post("/discuss-critique", async (req, res) => {
  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const { critique, messages = [] } = req.body;

    const prompt = `
Return JSON:

{
  "assistantMessage": "",
  "refinedSuggestion": null
}

Critique:
${JSON.stringify(critique)}

Messages:
${JSON.stringify(messages)}
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Return only JSON." },
        { role: "user", content: prompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const data = JSON.parse(raw);

    return res.json({
      assistantMessage: data.assistantMessage || "",
      refinedSuggestion: data.refinedSuggestion || null,
    });
  } catch (err) {
    return res.json({
      assistantMessage: "Error occurred",
      refinedSuggestion: null,
    });
  }
});

export default router;
