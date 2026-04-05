import { Router } from "express";
import Groq from "groq-sdk";
import crypto from "crypto";

const router = Router();

/* -------------------------------------------------------
   MAIN REFLECTION ENDPOINT
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

    const categoriesList =
      activeCritiqueCategories.length > 0
        ? activeCritiqueCategories.join(", ")
        : "accessibility, edge-cases, interaction-complexity, consistency, usability";

    const prompt = `
You are a senior UX design assistant.

Return STRICT JSON. No markdown. No commentary.

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
Design stage: ${designStage.join(", ")}
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

    const raw = completion.choices[0]?.message?.content || "";
    const data = JSON.parse(raw);

    /* -----------------------------
       NORMALIZE CRITIQUES
    ----------------------------- */
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

    /* -----------------------------
       NORMALIZE IMPROVEMENTS
    ----------------------------- */
    const normalizedImprovements = (data.improvements || []).map(
      (imp: any) => ({
        id: crypto.randomUUID(),
        text: typeof imp === "string" ? imp : imp?.text || "",
        applied: false,
      })
    );

    /* -----------------------------
       NORMALIZE CHANGE INSTRUCTIONS
    ----------------------------- */
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
   OPTIONS-ONLY ENDPOINT (Shuffle)
-------------------------------------------------------- */
router.post("/options", async (req, res) => {
  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const { goal, audience, productContext, designStage, contextSelection } =
      req.body;

    const prompt = `
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
Design stage: ${designStage.join(", ")}
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

    const raw = completion.choices[0]?.message?.content || "";
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
   OPTION REFINEMENT ENDPOINT
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
      option,
      messages = [],
    } = req.body;

    const prompt = `
You are a senior UX design assistant helping refine a single design option.

Return STRICT JSON. No markdown. No commentary.

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
Design stage: ${designStage.join(", ")}
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

    const raw = completion.choices[0]?.message?.content || "";
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

export default router;
