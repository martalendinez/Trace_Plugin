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
- Focus on user needs, motivations, pain points, and assumptions.
- Avoid UI-level feedback.
- Avoid layout, spacing, or visual critiques.
- Prioritize problem framing and hypothesis clarity.

If stage includes "wireframe":
- Focus on structure, flow, clarity, and interaction patterns.
- Avoid visual polish, typography, or color feedback.
- Avoid pixel-level comments.
- Prioritize layout logic and usability.

If stage includes "early-concept":
- Focus on conceptual alternatives, design directions, and tradeoffs.
- Encourage exploration and divergent thinking.
- Avoid detailed UI critique.

If stage includes "high-fidelity":
- Provide detailed UI critique: spacing, hierarchy, contrast, accessibility.
- Be specific and actionable.
- Avoid conceptual reframing unless necessary.

Selected design stage:
${designStage.join(", ")}
`;

/* -------------------------------------------------------
   MAIN ENDPOINT
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
      designContext = null,
      selectedOption,
      activeCritiqueCategories = [],
    } = req.body;

    const categoriesList =
      activeCritiqueCategories.length > 0
        ? activeCritiqueCategories.join(", ")
        : "accessibility, edge-cases, interaction-complexity, consistency, usability";

    const prompt = `
You are a senior UX design assistant.

Return STRICT JSON. No markdown. No commentary.

${buildDesignStageBehavior(designStage)}

Use the following extracted Figma design context to inform your critiques:
${designContext ? JSON.stringify(designContext, null, 2) : "None"}

CRITIQUES MUST:
- Be based on the selected option
- Match ONLY the selected categories
- Generate 2–4 critiques per selected category
- Use the exact category names provided

Selected option:
${selectedOption ? JSON.stringify(selectedOption, null, 2) : "None"}

Selected critique categories:
${categoriesList}

Goal: ${goal}
Audience: ${audience}
Product context: ${productContext}
Context selection: ${contextSelection.join(", ")}

Return JSON EXACTLY like this:

{
  "options": [],
  "critiques": [
    {
      "id": "string",
      "category": "one of the selected categories",
      "title": "short issue title",
      "concern": "1–2 sentence explanation",
      "suggestion": "1–2 sentence improvement",
      "uncertaintyNote": "short note"
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
        { role: "system", content: "You are a precise UX design expert." },
        { role: "user", content: prompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const data = JSON.parse(raw);

    const normalizedCritiques = (data.critiques || []).map((c: any) => {
      if (typeof c === "string") {
        return {
          id: crypto.randomUUID(),
          category: activeCritiqueCategories[0] || "usability",
          title: c,
          concern: c,
          suggestion: "Consider refining this aspect.",
          uncertaintyNote: "May not apply in all contexts.",
        };
      }

      return {
        id: c.id || crypto.randomUUID(),
        category: c.category || "usability",
        title: c.title || "Potential issue",
        concern: c.concern || "",
        suggestion: c.suggestion || "",
        uncertaintyNote: c.uncertaintyNote || "",
      };
    });

    const normalizedImprovements = (data.improvements || []).map(
      (imp: any) => ({
        id: crypto.randomUUID(),
        text: typeof imp === "string" ? imp : imp?.text || "",
        applied: false,
      })
    );

    const fallbackImprovements = normalizedCritiques.map((c: any) => ({
      id: crypto.randomUUID(),
      text: c.suggestion,
      applied: false,
    }));

    return res.json({
      critiques: normalizedCritiques,
      improvements:
        normalizedImprovements.length > 0
          ? normalizedImprovements
          : fallbackImprovements, // ⭐ IMPORTANT FIX
      changeInstructions: [],
      options: data.options || [],
    });
  } catch (err) {
    console.error("Error in /api/reflect:", err);
    return res.status(500).json({ error: "Failed to process reflection" });
  }
});

/* -------------------------------------------------------
   OPTIONS ENDPOINT (FULL FIXED)
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
      designContext = null,
    } = req.body;

    const prompt = `
You are a senior UX design assistant.

Return STRICT JSON. No markdown.

${buildDesignStageBehavior(designStage)}

Generate ONLY options.

{
  "options": [
    {
      "id": "string",
      "title": "short option name",
      "summary": "1–2 sentence summary",
      "problem": "what problem this option addresses",
      "assumption": "key assumption",
      "principle": "design principle",
      "tradeoff": "main trade-off",
      "suggestedChanges": []
    }
  ]
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

    const normalizedOptions = (data.options || []).map((o: any) => ({
      id: o.id || crypto.randomUUID(),
      title: o.title || "Untitled",
      summary: o.summary || "",
      problem: o.problem || "",
      assumption: o.assumption || "",
      principle: o.principle || "",
      tradeoff: o.tradeoff || "",
      suggestedChanges: o.suggestedChanges || [],
    }));

    const improvements = normalizedOptions.flatMap((o: any) => [
      {
        id: crypto.randomUUID(),
        text: o.problem ? `Fix: ${o.problem}` : "",
        applied: false,
      },
      {
        id: crypto.randomUUID(),
        text: o.tradeoff ? `Tradeoff: ${o.tradeoff}` : "",
        applied: false,
      },
    ]).filter(i => i.text);

    return res.json({
      options: normalizedOptions,
      improvements,
      critiques: [],
      changeInstructions: [],
    });
  } catch (err) {
    console.error("Error in /api/reflect/options:", err);
    return res.status(500).json({ error: "Failed to generate options" });
  }
});

/* -------------------------------------------------------
   REFINE OPTION
-------------------------------------------------------- */
router.post("/refine-option", async (req, res) => {
  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const {
      goal,
      audience,
      productContext,
      designStage = [],
      designContext = null,
      option,
      messages = [],
    } = req.body;

    const prompt = `
You refine UX options.

Return STRICT JSON.

${buildDesignStageBehavior(designStage)}

Option:
${JSON.stringify(option, null, 2)}

Messages:
${JSON.stringify(messages, null, 2)}

Return:
{
  "assistantMessage": "",
  "refinedOption": null
}
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Return JSON only." },
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
    console.error("Error in /refine-option:", err);
    return res.status(500).json({ error: "Failed to refine option" });
  }
});

/* -------------------------------------------------------
   DISCUSS CRITIQUE
-------------------------------------------------------- */
router.post("/discuss-critique", async (req, res) => {
  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const {
      critique,
      messages = [],
      goal,
      audience,
      productContext,
      designStage = [],
      designContext = null,
    } = req.body;

    const prompt = `
Return JSON only.

Critique:
${JSON.stringify(critique)}

Messages:
${JSON.stringify(messages)}

{
  "assistantMessage": "",
  "refinedSuggestion": null
}
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "JSON only." },
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
    console.error("Error:", err);
    return res.json({
      assistantMessage: "Error occurred",
      refinedSuggestion: null,
    });
  }
});

export default router;