import { Router } from "express";
import Groq from "groq-sdk";
import crypto from "crypto";

const router = Router();

/* -------------------------------------------------------
   DESIGN STAGE BEHAVIOR
-------------------------------------------------------- */
const buildDesignStageBehavior = (designStage: string[]) => `
Design stage behavior rules:

If stage includes "research":
- Focus on user needs, motivations, pain points, assumptions.
- Avoid UI-level feedback.

If stage includes "wireframe":
- Focus on structure, flow, and usability.
- Avoid visual polish feedback.

If stage includes "early-concept":
- Focus on ideas, directions, and tradeoffs.

If stage includes "high-fidelity":
- Focus on UI details like spacing, hierarchy, accessibility.

Selected design stage:
${designStage.join(", ")}
`;

/* -------------------------------------------------------
   MAIN REFLECTION
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
   OPTIONS
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
    } = req.body;

    const prompt = `
You are a UX expert.

Return ONLY options JSON.

${buildDesignStageBehavior(designStage)}

{
  "options": [
    {
      "id": "string",
      "title": "title",
      "summary": "summary",
      "problem": "problem",
      "assumption": "assumption",
      "principle": "principle",
      "tradeoff": "tradeoff",
      "suggestedChanges": []
    }
  ]
}

Goal: ${goal}
Audience: ${audience}
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
   ⭐ IMPROVEMENTS (FULL FIX — NO OPTION REQUIRED)
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