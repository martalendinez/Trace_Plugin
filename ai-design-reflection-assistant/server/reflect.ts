import { Router } from "express";
import Groq from "groq-sdk";

const router = Router();

router.post("/", async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      console.error("Missing GROQ_API_KEY");
      return res.status(500).json({ error: "Server misconfiguration: missing API key" });
    }

    const client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const {
      goal,
      audience,
      productContext,
      designStage = [],
      contextSelection = [],
      options = [],
    } = req.body;

    const prompt = `
You are a senior UX design assistant.

Analyze the following design context and return ONLY valid JSON.
Do not include explanations, markdown, or extra text.

Goal: ${goal}
Audience: ${audience}
Product context: ${productContext}
Design stage: ${designStage.join(", ")}
Context selection: ${contextSelection.join(", ")}

User-generated options:
${options.map((o: any) => `- ${o.title}: ${o.summary}`).join("\n")}

Return JSON with this exact structure:
{
  "options": [],
  "critiques": [],
  "improvements": [],
  "changeInstructions": []
}
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile", // ✅ UPDATED MODEL
      messages: [
        {
          role: "system",
          content: "You are a precise and critical UX design expert.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "";

    console.log("RAW AI RESPONSE:", raw);

    let data;

    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error("JSON parse error:", raw);
      return res.status(500).json({ error: "Invalid AI JSON response" });
    }

    return res.json({
      options: data.options ?? [],
      critiques: data.critiques ?? [],
      improvements: data.improvements ?? [],
      changeInstructions: data.changeInstructions ?? [],
    });

  } catch (err) {
    console.error("Error in /api/reflect:", err);
    return res.status(500).json({ error: "Failed to process reflection" });
  }
});

export default router;