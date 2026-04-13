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
   MAIN REFLECTION ENDPOINT (CRITIQUES + IMPROVEMENTS)
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
      designContext = null,   // ⭐ NEW
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
          suggestion: "Consider refining this aspect for clarity.",
          uncertaintyNote: "This critique may not apply in all contexts.",
        };
      }

      return {
        id: c.id || crypto.randomUUID(),
        category: c.category || activeCritiqueCategories[0] || "usability",
        title: c.title || "Potential issue",
        concern: c.concern || "",
        suggestion: c.suggestion || "",
        uncertaintyNote:
          c.uncertaintyNote || "This critique may not apply in all contexts.",
      };
    });

    const normalizedImprovements = (data.improvements || []).map(
      (imp: any) => ({
        id: crypto.randomUUID(),
        text: typeof imp === "string" ? imp : imp?.text || "",
        applied: false,
      })
    );

    const normalizedChangeInstructions = (data.changeInstructions || [])
      .map((ci: any) => {
        if (!ci || typeof ci !== "object") return null;

        if (ci.type === "update_text") {
          return {
            type: "update_text",
            nodeId: ci.nodeId || "",
            value: ci.value || "",
          };
        }
        if (ci.type === "change_color") {
          return {
            type: "change_color",
            nodeId: ci.nodeId || "",
            color: ci.color || "#000000",
          };
        }
        if (ci.type === "resize_node") {
          return {
            type: "resize_node",
            nodeId: ci.nodeId || "",
            width: Number(ci.width) || 0,
            height: Number(ci.height) || 0,
          };
        }
        return null;
      })
      .filter(Boolean);

    return res.json({
      critiques: normalizedCritiques,
      improvements: normalizedImprovements,
      changeInstructions: normalizedChangeInstructions,
      options: data.options || [],
    });
  } catch (err) {
    console.error("Error in /api/reflect:", err);
    return res.status(500).json({ error: "Failed to process reflection" });
  }
});

/* -------------------------------------------------------
   OPTIONS-ONLY ENDPOINT (USES DESIGN CONTEXT)
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
      designContext = null,   // ⭐ NEW
    } = req.body;

    const prompt = `
You are a senior UX design assistant.

Return STRICT JSON. No markdown. No commentary.

${buildDesignStageBehavior(designStage)}

Use the following extracted Figma design context to inform your options:
${designContext ? JSON.stringify(designContext, null, 2) : "None"}

Generate ONLY the "options" array. STRICT JSON.

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

Goal: ${goal}
Audience: ${audience}
Product context: ${productContext}
Context selection: ${contextSelection.join(", ")}
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are a UX design expert." },
        { role: "user", content: prompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const data = JSON.parse(raw);

    const normalizedOptions = (data.options || []).map((o: any) => ({
      id: o.id || crypto.randomUUID(),
      title: o.title || "Untitled option",
      summary: o.summary || "",
      problem: o.problem || "",
      assumption: o.assumption || "",
      principle: o.principle || "",
      tradeoff: o.tradeoff || "",
      suggestedChanges: Array.isArray(o.suggestedChanges)
        ? o.suggestedChanges
        : [],
    }));

    return res.json({ options: normalizedOptions });
  } catch (err) {
    console.error("Error in /api/reflect/options:", err);
    return res.status(500).json({ error: "Failed to generate options" });
  }
});

/* -------------------------------------------------------
   OPTION REFINEMENT ENDPOINT (USES DESIGN CONTEXT)
-------------------------------------------------------- */
router.post("/refine-option", async (req, res) => {
  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const {
      goal,
      audience,
      productContext,
      designStage = [],
      contextSelection = [],
      designContext = null,   // ⭐ NEW
      option,
      messages = [],
    } = req.body;

    const prompt = `
You are a senior UX design assistant helping refine a single design option.

Return STRICT JSON. No markdown. No commentary.

${buildDesignStageBehavior(designStage)}

Use the following extracted Figma design context to inform your refinement:
${designContext ? JSON.stringify(designContext, null, 2) : "None"}

You will receive:
- The current option
- The conversation so far
- The latest user message

You MUST:
- Respond as the AI in the conversation
- Optionally propose a refined version of the option

Return JSON EXACTLY like this:

{
  "assistantMessage": "your reply to the user",
  "refinedOption": {
    "id": "string",
    "title": "short option name",
    "summary": "1–2 sentence summary",
    "problem": "what problem this option addresses",
    "assumption": "key assumption",
    "principle": "design principle",
    "tradeoff": "main trade-off",
    "suggestedChanges": []
  }
}

If you do NOT want to change the option, set "refinedOption" to null.

Current option:
${JSON.stringify(option, null, 2)}

Conversation so far:
${JSON.stringify(messages, null, 2)}

Goal: ${goal}
Audience: ${audience}
Product context: ${productContext}
Context selection: ${contextSelection.join(", ")}
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

    return res.json({
      assistantMessage: data.assistantMessage || "",
      refinedOption: data.refinedOption || null,
    });
  } catch (err) {
    console.error("Error in /api/reflect/refine-option:", err);
    return res.status(500).json({ error: "Failed to refine option" });
  }
});

/* -------------------------------------------------------
   CRITIQUE DISCUSSION ENDPOINT (USES DESIGN CONTEXT)
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
      contextSelection = [],
      designContext = null,   // ⭐ NEW
    } = req.body;

    const prompt = `
You are a senior UX design assistant helping discuss a critique.

Return STRICT JSON. No markdown. No commentary.

${buildDesignStageBehavior(designStage)}

Use the following extracted Figma design context to inform your discussion:
${designContext ? JSON.stringify(designContext, null, 2) : "None"}

You will receive:
- The critique
- The conversation so far
- The latest user message

You MUST:
- Respond as the AI in the conversation
- Optionally propose a refined suggestion

Return JSON EXACTLY like this:

{
  "assistantMessage": "your reply to the user",
  "refinedSuggestion": "optional refined suggestion or null"
}

Critique:
${JSON.stringify(critique, null, 2)}

Conversation so far:
${JSON.stringify(messages, null, 2)}

Goal: ${goal}
Audience: ${audience}
Product context: ${productContext}
Context selection: ${contextSelection.join(", ")}
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You MUST return valid JSON. No markdown. No commentary. No natural language outside JSON.",
        },
        { role: "user", content: prompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = {
        assistantMessage: raw,
        refinedSuggestion: null,
      };
    }

    return res.json({
      assistantMessage: data.assistantMessage || "",
      refinedSuggestion: data.refinedSuggestion || null,
    });
  } catch (err) {
    console.error("Error in /api/reflect/discuss-critique:", err);
    return res.json({
      assistantMessage:
        "Something went wrong while discussing this critique.",
      refinedSuggestion: null,
    });
  }
});

export default router;
