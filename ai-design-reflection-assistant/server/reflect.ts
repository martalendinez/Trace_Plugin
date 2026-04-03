const { Router } = require("express");
const OpenAI = require("openai");
require("dotenv").config();

const router = Router();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", async (req, res) => {
  try {
    const {
      goal,
      audience,
      productContext,
      designStage,
      contextSelection,
      options,
    } = req.body;

    const prompt = `
You are a senior UX design assistant. Analyze the following design context and return structured JSON only.

Goal: ${goal}
Audience: ${audience}
Product context: ${productContext}
Design stage: ${designStage.join(", ")}
Context selection: ${contextSelection.join(", ")}

User-generated options:
${options.map((o) => `- ${o.title}: ${o.summary}`).join("\n")}

Return JSON with:
{
  "options": [...],
  "critiques": [...],
  "improvements": [...],
  "changeInstructions": [...]
}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4.1",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are a precise UX design assistant." },
        { role: "user", content: prompt },
      ],
    });

    const data = JSON.parse(completion.choices[0].message.content);

    res.json({
      options: data.options ?? [],
      critiques: data.critiques ?? [],
      improvements: data.improvements ?? [],
      changeInstructions: data.changeInstructions ?? [],
    });
  } catch (err) {
    console.error("Error in /api/reflect:", err);
    res.status(500).json({ error: "Failed to process reflection" });
  }
});

module.exports = router;
